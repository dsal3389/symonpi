const fs = require('fs');
const path = require('path');
const settings = require('../settings/settings');


const MODULE_FOLDER = './';
const MODULE_FOLDER_PATH = path.join(__dirname, MODULE_FOLDER);
const ENCODING = settings.get('encoding');


class ModuleManager{
    
    constructor(){
        this.modules = new Map();
    }

    /**
     * this function is passed as an emitter to all modules
     * so they (the modules) will be aible to share information
     * with each other
     * 
     * @param {str} module
     * @returns {module instance}
     **/
    getModuleInstance = (module) => {
        if(typeof module == 'string' || module instanceof String){
            return this._modules.get(module);
        }
        throw new Error('module lookup requires a string');
    }

    /**
     * reads modules dynamicliy from variable MODULE_FOLDER_PATH,
     * initilized only once by the SymonPI object
     * 
     * @param {express app} app 
     */
    loadModulesOn = (app) => {
        this.__read_directory(MODULE_FOLDER_PATH, (err, files) => {
            if(err !== null) throw err;

            for(const item of files){
                const abspath = path.join(MODULE_FOLDER_PATH, item.name);

                if(this._is_folder(abspath)){
                    this._load_module(abspath, item.name, app);
                };
            }
        });
    }

    /**
     * importing the module from the folder + module_name + '.js', then loading an instance 
     * on the module and registering it into this.modules, after that calling moduleinit and routes
     * 
     *  @param {str} folderpath
     *  @param {str} name
     *  @param {express app} app
     */
    _load_module = (folderpath, name, app) => {
        const realpath = path.join(folderpath, name + '.js');
        const module   = require(realpath);
        const module_instance = new module();

        this.modules.set(name, module_instance);
        module_instance.moduleinit();
        module_instance.moduleroutes();

        app.use(
            (module_instance.moduleroot !== undefined ? module_instance.moduleroot : '/' + name).toLowerCase(),
            module_instance.moduleapp
        );
    }

    _is_folder(path){
        return fs.statSync(path, {encoding: ENCODING}).isDirectory();
    }

    __read_directory(path, callback){
        fs.readdir(path, {
            encoding: ENCODING,
            withFileTypes: true,
        }, callback);
    }
}

/**
 * one manager for the symonpi, allowing all module get the same manager
 * and share information netween with the function getModuleInstance
 */
module.exports = new ModuleManager();
