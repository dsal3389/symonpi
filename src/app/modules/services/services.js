const express = require('express');


class ServicesModule{
    
    constructor(){
        this.moduleapp  = express();
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
