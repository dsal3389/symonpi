const express = require('express');
const { shadowfile } = require('./_users');


class UsersModule{

    constructor(){
        this.moduleapp  = express();
        this.shadowfile = shadowfile; // allowing other modules import this variable
    }

    moduleinit(){
        
    }

    moduleroutes(){
        this.moduleapp.get('/list', (req, res) => {
            const users = this.shadowfile.getUsers(...Object.keys(req.query));
            res.send(users);
        });

        this.moduleapp.get('/search', (req, res) => {
            res.send(this.shadowfile.search(req.query));
        });

        this.moduleapp.get('/:uid', (req, res) => {
            res.send(this.shadowfile.getUserByID(req.params.uid));
        });
    }
}


module.exports = UsersModule;
