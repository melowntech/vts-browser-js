
import {globals as globals_, stringToUint8Array as stringToUint8Array_ } from './worker-globals.js';

//get rid of compiler mess
var globals = globals_, stringToUint8Array = stringToUint8Array_;
var tmpVertexBuffer = new Uint8Array(65536*4*4*4*4);
var tmpVertexBuffer2 = new Uint8Array(65536*4*4*4*4);

function postGroupMessageFast(command, type, message, buffers, signature) {

    var message2 = stringToUint8Array(JSON.stringify(message));
    var messageSize = 1+1+4+message2.byteLength, i, li;

    for (i = 0, li = buffers.length; i < li; i++) {
        messageSize += 4+buffers[i].byteLength;
    }

    var buff = new Uint8Array(messageSize);
    var view = new DataView(buff.buffer), index = 0, index2 = 0;

    view.setUint8(index, command); index += 1;
    view.setUint8(index, type); index += 1;
    view.setUint32(index, message2.byteLength); index += 4;
    buff.set(message2, index); index += message2.byteLength;
    index2 = index;

    for (i = 0, li = buffers.length; i < li; i++) {
        view.setUint32(index, buffers[i].length); index += 4;
        buff.set( new Uint8Array(buffers[i].buffer), index); index += buffers[i].byteLength;
    }

    postGroupMessageDirect(command, type, buff.buffer, index2, signature, message['hitable'], message['totalPoints'], (type == VTS_WORKER_TYPE_LINE_LABEL) ? message : null);
}

function postGroupMessageLite(command, type, number) {
    var messageSize = 1+1+4, index = 0;

    var buff = new ArrayBuffer(messageSize);
    var view = new DataView(buff), index = 0;

    view.setUint8(index, command); index += 1;
    view.setUint8(index, type); index += 1;
    view.setUint32(index, (number ? number : 0)); index += 4;

    postGroupMessageDirect(command, type, buff, index, "");
}


function postGroupMessageDirect(command, type, message, buffersIndex, signature, hitable, totalPoints, job2) {

    if (globals.messageBufferIndex >= globals.messageBufferSize) { 
        var oldBuffer = globals.messageBuffer; 
        globals.messageBufferSize += 65536;
        globals.messageBuffer = new Array(globals.messageBufferSize);
        
        for (var i = 0, li = globals.messageBufferIndex; i < li; i++) {
            globals.messageBuffer[i] = oldBuffer[i];
        }
    }
    
    globals.messageBuffer[globals.messageBufferIndex] = { command: command, type: type, job : message, buffersIndex: buffersIndex, signature: signature, hitable: hitable, totalPoints: totalPoints, job2: job2 };
    globals.messageBufferIndex++;
    globals.messagePackSize += message.byteLength;
}


function optimizeGroupMessages() {

    //loop messages
    var messages = globals.messageBuffer;
    var j, lk, k, message2, job2, bufferSize, buffer, view, index, length, buff, buff2, index, count, totalVertices;

    //try {

    for (var i = 0, li = globals.messageBufferIndex; i < li; i++) {
        var message = messages[i];
        var job = message.job;
        var type = message.type;
        var signature = message.signature;
        
        if (!message.hitable && !message.reduced && 
            (type >= VTS_WORKER_TYPE_FLAT_LINE && type <= VTS_WORKER_TYPE_LINE_LABEL)) {
            
            switch(type) {
            case VTS_WORKER_TYPE_FLAT_LINE:
                count = 0;

                //get message vertices length and copy vertices to buffer
                length = (new DataView(message.job)).getUint32(message.buffersIndex) * 4;

                tmpVertexBuffer.set(new Uint8Array(message.job, message.buffersIndex+4, length), 0);
                bufferSize = length;

                for (j = i + 1; j < li; j++) {
                    message2 = messages[j];

                    if (message2.signature == signature) {
                        message2.reduced = true;
                        count++;

                        //get message2 vertices length
                        length = (new DataView(message2.job)).getUint32(message2.buffersIndex) * 4;

                        // copy vertices to buffer
                        tmpVertexBuffer.set(new Uint8Array(message2.job, message2.buffersIndex+4, length), bufferSize);
                        bufferSize += length;
                    }
                }

                if (count > 0) {

                    //create new message with merged vertices
                    buffer = new Uint8Array(message.buffersIndex+2*(4+bufferSize));
                    view = new DataView(buffer.buffer);
                    buffer.set(new Uint8Array(message.job, 0, message.buffersIndex), 0);

                    view.setUint32(message.buffersIndex, bufferSize / 4);
                    buffer.set(new Uint8Array(tmpVertexBuffer.buffer, 0, bufferSize), message.buffersIndex + 4);

                    globals.messagePackSize -= message.job.byteLength;
                    globals.messagePackSize += buffer.byteLength;
                    message.job = buffer.buffer;
                }

                break;
                    
            case VTS_WORKER_TYPE_PIXEL_LINE:
            case VTS_WORKER_TYPE_LINE_LABEL:
            case VTS_WORKER_TYPE_FLAT_RLINE:

                count = 0;
                totalVertices = 0;

                //get message vertices length and copy vertices to buffer
                length = (new DataView(message.job)).getUint32(message.buffersIndex);
                //console.log('count: ' + count + ' totalPoints:' + message.totalPoints + ' length: ' + length);
                length *= 4;
                totalVertices += length;


                tmpVertexBuffer.set(new Uint8Array(message.job, message.buffersIndex+4, length), 0);
                tmpVertexBuffer2.set(new Uint8Array(message.job, message.buffersIndex+4+length+4, length), 0);
                bufferSize = length;

                for (j = i + 1; j < li; j++) {
                    message2 = messages[j];

                    if (message2.signature == signature) {
                        message2.reduced = true;
                        count++;

                        //get message2 vertices length
                        length = (new DataView(message2.job)).getUint32(message2.buffersIndex);
                        //console.log('count:' + count + ' totalPoints:' + message2.totalPoints + ' length:' + length + ' jobl:' + message2.job.byteLength + ' remaning:' + (message2.job.byteLength - (message2.buffersIndex+4)) + ' bufferSize:' + bufferSize + ' totalVertices:' + totalVertices);
                        length *= 4;
                        totalVertices += length;


                        // copy vertices to buffer
                        tmpVertexBuffer.set(new Uint8Array(message2.job, message2.buffersIndex+4, length), bufferSize);

                        // copy normals to buffer
                        tmpVertexBuffer2.set(new Uint8Array(message2.job, message2.buffersIndex+4+length+4, length), bufferSize);
                        bufferSize += length;

                        if (type == VTS_WORKER_TYPE_LINE_LABEL) {
                            var files = message.job2['files'];
                            var files2 = message2.job2['files'];

                            for (k = 0, lk = files2.length; k < lk; k++) {
                                if (!files[k]) {
                                    files[k] = [];
                                }

                                for (var m = 0, lm = files2[k].length; m < lm; m++) {
                                    if (files[k].indexOf(files2[k][m]) == -1) {
                                        files[k].push(files2[k][m]);
                                    }
                                }
                            }
                        }
                    }
                }

                if (count > 0) {

                    //create new message with merged vertices

                    if (type == VTS_WORKER_TYPE_LINE_LABEL) { //we have to rebuild header
                        var buffjob = stringToUint8Array(JSON.stringify(message.job2));

                        buffer = new Uint8Array(1+1+4+buffjob.byteLength+2*(4+bufferSize));
                        view = new DataView(buffer.buffer), index = 0;

                        view.setUint8(index, message.command); index += 1;
                        view.setUint8(index, type); index += 1;
                        view.setUint32(index, buffjob.byteLength); index += 4;
                        buffer.set(buffjob, index); index += buffjob.byteLength;

                        message.buffersIndex = index;
                    } else {
                        buffer = new Uint8Array(message.buffersIndex+2*(4+bufferSize));
                        view = new DataView(buffer.buffer);
                        buffer.set(new Uint8Array(message.job, 0, message.buffersIndex), 0);
                    }

                    view.setUint32(message.buffersIndex, bufferSize / 4);
                    buffer.set(new Uint8Array(tmpVertexBuffer.buffer, 0, bufferSize), message.buffersIndex + 4);

                    view.setUint32(message.buffersIndex + 4 + bufferSize, bufferSize / 4);
                    buffer.set(new Uint8Array(tmpVertexBuffer2.buffer, 0, bufferSize), message.buffersIndex + 4 + bufferSize + 4 );

                    globals.messagePackSize -= message.job.byteLength;
                    globals.messagePackSize += buffer.byteLength;
                    message.job = buffer.buffer;

                }

                break;
            }
           
        }
    }

    //} catch(e) {
      //  debugger    
    //}

    var buffer = new Uint8Array(globals.messagePackSize), index = 0;

    for (var i = 0, li = globals.messageBufferIndex; i < li; i++) {
        buffer.set(new Uint8Array(globals.messageBuffer[i].job), index);
        index += globals.messageBuffer[i].job.byteLength;
    }

    postMessage({'command' : 'addPackedCommands', 'buffer': buffer}, [buffer.buffer]);

    globals.messageBufferIndex = 0;
    globals.messagePackSize = 0;
} 

/*
function optimizeGroupMessages() {
    //debugger;

    optimizeGroupMessagesFast();
    return;

    //loop messages
    var messages = globals.messageBuffer;
    var j, lk, k, message2, job2, vbufferSize, vbuffer, index, buff, buff2;

    if (globals.messageBufferIndex <= 2) { //empty group?
        globals.messageBufferIndex = 0;
        return;
    }

    for (var i = 0, li = globals.messageBufferIndex; i < li; i++) {
        var message = messages[i];
        var job = message.job;
        var type = job['type'];
        var signature = message.signature;
        
        if (!job['hitable'] && !message.reduced &&  //!job["culling"] &&
            !(type == 'icon' || type == 'label' ||
              type == 'line-geometry' || type == 'point-geometry')) {
            
            switch(type) {
            case 'flat-line':
                vbufferSize = job['vertexBuffer'].length;

                for (j = i + 1; j < li; j++) {
                    message2 = messages[j];
                        
                    if (message2.signature == signature) {
                        message2.reduced = true;
                        vbufferSize += message2.job['vertexBuffer'].length;
                    }
                }

                vbuffer = new Float32Array(vbufferSize);
                index = 0;

                for (j = i; j < li; j++) {
                    message2 = messages[j];
                    job2 = message2.job;
                        
                    if (message2.signature == signature) {
                        buff = job2['vertexBuffer'];
                        job2['vertexBuffer'] = null;
                        for (k = 0, lk = buff.length; k < lk; k++) {
                            vbuffer[index+k] = buff[k];
                        }
                        index += lk;
                    }
                }

                job['vertexBuffer'] = vbuffer;
                message.arrays = [vbuffer.buffer];
                break;
                    
            case 'pixel-line':
            case 'line-label':
            case 'flat-rline':

                vbufferSize = job['vertexBuffer'].length;

                for (j = i + 1; j < li; j++) {
                    message2 = messages[j];

                    if (message2.signature == signature) {
                        message2.reduced = true;
                        vbufferSize += message2.job['vertexBuffer'].length;
                    }
                }

                vbuffer = new Float32Array(vbufferSize);
                var nbuffer = new Float32Array(vbufferSize);
                index = 0;

                for (j = i; j < li; j++) {
                    message2 = messages[j];
                    job2 = message2.job;
                        
                    if (message2.signature == signature) {
                        buff = job2['vertexBuffer'];
                        job2['vertexBuffer'] = null;
                            
                        if (type == 'line-label') {
                            buff2 = job2['texcoordsBuffer'];
                            job2['texcoordsBuffer'] = null;
                        } else {
                            buff2 = job2['normalBuffer'];
                            job2['normalBuffer'] = null;
                        }
                            
                        for (k = 0, lk = buff.length; k < lk; k++) {
                            vbuffer[index+k] = buff[k];
                            nbuffer[index+k] = buff2[k];
                        }

                        index += lk;

                        if (type == 'line-label') {
                            var files = job['files'];
                            var files2 = job2['files'];

                            for (k = 0, lk = files2.length; k < lk; k++) {
                                if (!files[k]) {
                                    files[k] = [];
                                }

                                for (var m = 0, lm = files2[k].length; m < lm; m++) {
                                    if (files[k].indexOf(files2[k][m]) == -1) {
                                        files[k].push(files2[k][m]);
                                    }
                                }
                            }
                        }
                    }
                }

                job['vertexBuffer'] = vbuffer;

                if (type == 'line-label') {
                    job['texcoordsBuffer'] = nbuffer;
                } else {
                    job['normalBuffer'] = nbuffer;
                }

                message.arrays = [vbuffer.buffer, nbuffer.buffer];
                break;
            }

            postMessage(message.job, message.arrays);
            
        } else if (!message.reduced) {

            postMessage(message.job, message.arrays);

        }
    }

    globals.messageBufferIndex = 0;
} 
*/

export {optimizeGroupMessages, postGroupMessageFast, postGroupMessageLite};

