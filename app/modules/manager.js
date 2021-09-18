const services = require('./services/services');
const users    = require('./users/users');


class ModuleManager{
    constructor(){
        this.modules = [
            services,
            users
        ];
        this._modules = new Map();
    }

    /*
    this function is passed as an emitter to all modules
    so they (the modules) will be aible to share information
    with each other
    */
    getModuleInstance(module){
        if(typeof module == 'string' || module instanceof String){
            return this._modules.get(module);
        }
        return this._modules.get(module);
    }

    loadModulesOn(app){
        for(let module of this.modules){
            const module_instance = new module(this.getModuleInstance);

            this._modules.set(
                module_instance.constructor.name.toLocaleLowerCase(), 
                module_instance
            );
            module_instance.moduleinit();
            module_instance.routes(); // load module routes
            app.use(module_instance.root, module_instance.app);
        }
    }
}


module.exports = ModuleManager;
