
import {globals as globals_} from './worker-globals.js';

//get rid of compiler mess
var globals = globals_;


function postGroupMessage(message, arrays, signature) {

    if (globals.groupOptimize) {
        if (globals.messageBufferIndex >= globals.messageBufferSize) { //resize buffer
            var oldBuffer = globals.messageBuffer; 
            globals.messageBufferSize += 65536;
            globals.messageBuffer = new Array(globals.messageBufferSize);
            globals.messageBuffer2 = new Array(globals.messageBufferSize);
            
            for (var i = 0, li = globals.messageBufferIndex; i < li; i++) {
                globals.messageBuffer[i] = oldBuffer[i];
            }
        }
        
        globals.messageBuffer[globals.messageBufferIndex] = { job : message, arrays: arrays, signature : signature };
        globals.messageBufferIndex++;
    } else {
        postMessage(message, arrays);
    }
}


function optimizeGroupMessages() {
    //debugger;
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


export {postGroupMessage, optimizeGroupMessages};

