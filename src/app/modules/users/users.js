const express = require('express');

const { shadowfile, shells } = require('./_users');


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
            const uid = req.params.uid;
            const user = this.shadowfile.getUserByID(uid);

            if(user === undefined){
                res.status(404).send(`user with the uid ${uid} not found`);
            }
            res.send(user);
        });

        this.moduleapp.delete('/:uid', (req, res) => {
            const uid = req.params.uid;
            const user = this.shadowfile.getUserByID(uid);

            if(user === undefined){
                return res.status(404).send('could not find client with the given UID to delete');
            }
            
            const removehome = req.query.removehome == 'true';
            const force = req.query.force == 'true';

            shadowfile.deleteUser(user.name, removehome, force).then(
                (code) => res.status(200).send(`client with the uid of ${uid} deleted (${user})`),
                (code) => {
                    const errormessages = {
                        1: 'cant update password file',
                        2: 'invalid command syntax',
                        6: 'specific user does not exists',
                        8: 'user currently logged',
                        10: 'cant update group file',
                        12: 'cant remove home directory'
                    };

                    res.status(406).send(errormessages[code]);
                }
            );
            
        });

        this.moduleapp.post('/create', (req, res) => {
            const name = req.body.name;
            const shell = req.body.shell || '/bin/sh';
            const group = req.body.group || null;
            const create_home = req.body.create_home !== undefined ? req.body.create_home : true;
            const home = req.body.home || null;

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
                (code) =>  {
                    const errormessages = { // non related error codes will not be here
                        1: 'cant update password',
                        3: 'invalid argument to option',
                        6: 'specified group does not exists',
                        9: 'username already in use',
                        10: 'cant update group file',
                        12: 'cant create home directory',
                        13: 'cant create mail spool',
                        14: 'cant update SELinux user mapping'
                    }

                    res.status(406).send(errormessages[code]);
                }
            );
        });
    }
}


module.exports = UsersModule;
