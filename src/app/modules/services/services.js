const express = require('express');


class ServicesModule{
    constructor(emitter){
        this.moduleapp  = express();
        this.emitt = emitter;
        
        this.services = [];
    }

    moduleinit(){
        
    }

    moduleroutes(){
        this.moduleapp.get('/', (req, res) => {
            res.send('services');
        });
    }
}


module.exports = ServicesModule;
