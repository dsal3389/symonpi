const express  = require('express');

const settings = require('./settings/settings');
const manager  = require('./modules/manager');
const { getLogging } = require('./logging/logging');


const port = settings.get('port');
const logging = getLogging('root');


class SymonPI{
    
    constructor(){
        this.app = express();
        this.manager = manager;
    }

    loadModules = () => {
        this.manager.loadModulesOn(this.app);
    }

    middleware = () => {
        this.app.use(logging._loggingMiddleware);
    }

    run = () => {
        this.app.listen(port, () => {
            logging.log(`server is up and running at port ${port}`);
        });
    }
}


const app = new SymonPI();
app.loadModules();
app.middleware();
app.run();
