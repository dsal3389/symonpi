const express = require('express');

const { shadowfile, passwd, shells } = require('./_users');


const usernotfoundmsg = (uid) => `given user with the uid ${uid} was not found`;


class UsersModule{

    constructor(){
        this.moduleapp  = express();
    }

    moduleinit(){
        
    }

    moduleroutes(){
        
        this.moduleapp.get('/list', (req, res) => {
            const users = shadowfile.getUsers(...Object.keys(req.query));
            res.send(users);
        });

        this.moduleapp.get('/search', (req, res) => {
            res.send(shadowfile.search(req.query));
        });

        this.moduleapp.post('/create', (req, res) => {
            const name  = req.body.name;
            const shell = req.body.shell || '/bin/sh';
            const group = req.body.group || null;
            const home  = req.body.home  || null;
            const create_home = req.body.create_home === 'true';

            if(name === undefined){
                return res.status(406).send('missing required parameters: name');
            }

            if(!shells.isValidShell(shell)){
                return res.status(406).send(`given shell is not valid ${shell}`);
            }
            
            shadowfile.createUser(
                name, shell,
                create_home, group, home
            ).then(
                (code) =>  res.status(201).send(`user ${name} created`),
                (code) =>  res.status(406).send(shadowfile.createErrorMessages[code])
            );
        });

        this.moduleapp.get('/:uid', (req, res) => {
            const uid = req.params.uid;
            const user = shadowfile.getUserByID(uid);
            
            if(user === undefined){
                return res.status(404).send(usernotfoundmsg(uid));
            }

            res.send(user);
        });

        this.moduleapp.delete('/:uid', (req, res) => {
            const uid = req.params.uid;
            const user = shadowfile.getUserByID(uid);

            if(user === undefined){
                return res.status(404).send(usernotfoundmsg(uid));
            }

            const removehome = req.query.removehome == 'true';
            const force = req.query.force == 'true';

            shadowfile.deleteUser(user.name, removehome, force).then(
                (code) => res.status(200).send(`client with the uid of ${uid} deleted (${user})`),
                (code) => res.status(406).send(shadowfile.deleteErrorMessages[code])
            );
        }); 

        this.moduleapp.put('/:uid/passwd', (req, res) => {
            const uid = req.params.uid;
            const user = shadowfile.getUserByID(uid);

            if(user === undefined){
                return res.status(404).send(usernotfoundmsg(uid));
            }

            // need to configure it as well
        });

        this.moduleapp.delete('/:uid/passwd', (req, res) => {
            const uid = req.params.uid;
            const user = shadowfile.getUserByID(uid);

            if(user === undefined){
                return res.status(404).send(usernotfoundmsg(uid));
            }

            passwd.deletePassword(user.name).then(
                (code) => res.status(200).send(`password deleted for user ${user.name}`),
                (code) => res.status(406).send(passwd.errorMessages[code])
            );
        });
    }
}


module.exports = UsersModule;
