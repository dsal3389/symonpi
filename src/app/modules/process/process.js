const express = require('express');


class ProcessModule{
    constructor(emitter){
        this.moduleapp  = express();
        this.moduleroot = '/proc';

        this.emitt = emitter;
    }

    moduleinit(){
        console.log('prcesses')
    }

    moduleroutes(){
        
    }
}


module.exports = ProcessModule;
