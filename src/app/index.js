const express = require('express');
const ModuleManager = require('./modules/manager');


const port = 8080;


class App{
    constructor(){
        this.app = express();
        this.manager = new ModuleManager();
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


const app = new App();
app.loadModules();
app.routes();
app.run();
