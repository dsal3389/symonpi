const express  = require('express');
const settings = require('./settings/settings');
const manager  = require('./modules/manager');


const port = settings.get('port');


class SymonPI{
    constructor(){
        this.app = express();
        this.manager = manager;
    }

    loadModules(){
        this.manager.loadModulesOn(this.app);
    }

    routes(){
        this.app.get('/', (req, res) => {
            res.send('Hello world');
        });
    }

    run(){
        this.app.listen(port, () => {
            console.log(`[+] server is up and running at port ${port}`);
        });
    }
}


const app = new SymonPI();
app.loadModules();
app.routes();
app.run();
