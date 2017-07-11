
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


export {postGroupMessage};

