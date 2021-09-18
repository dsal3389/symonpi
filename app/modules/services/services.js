const express = require('express');


class ServicesModule{
    constructor(emitt){
        this.root = '/services';
        this.app = express();
        this.emitter = emitt;
        
        this.services = [];
    }

    moduleinit(){
        
    }

    routes(){
        this.app.get('/', (req, res) => {
            res.send('services');
        });
    }
}


module.exports = ServicesModule;
