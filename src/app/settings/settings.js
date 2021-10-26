const fs = require('fs');


const SETTINGS_FILE_PATH = '/etc/symonpi.json';
const WRITEABLE_FIELD = 'writeable';
const VALUE_FIELD = 'value';


class Settings{
    
    constructor(path){
        this.path = path;
        this._settings = new Map([
            ['port',        { value: 8080, _writeable: true }],
            ['usersFile',   { value: '/etc/passwd', _writeable: false }],
            ['encoding',    { value: 'utf-8', _writeable: true }],
            ['loggingFile', { value: '/var/log/symonpi.log', _writeable: true }],
            ['shellsfile',  { value: '/etc/shells', _writeable: false }]
        ]);
        this._read_settings();
    }

    /** 
     * get a settings value, return undefined if this key does not exists
     * 
     * @param {str} key
     * @returns {any | undefined}
     **/
    get(key){
        const value = this._settings.get(key);

        if(value){
            return value['value'];
        }
    }

    /**
     * setting a key value, the writable option tells if this value
     * can be changed after this initilization, like a const
     * 
     * @param {str} key
     * @param {any} value
     * @param {boolean} writeable
     **/
    set(key, value, writeable=true){

        if(this._settings.has(key)){
            this._set_existing_value(key, value);
        } else {
            this._settings.set(
                key, 
                {
                    value: value, 
                    _writeable: writeable
                }
            );
        }
    }

    _set_existing_value(key, value){
        const objvalue = this._settings.get(key);

        if(!objvalue['_writeable']){
            throw new Error('value is not writeable');
        }

        objvalue['value'] = value;
    }
    
    /**
     * read the settings file as the Settings instance is being created,
     * allowing for an early error (in case there is any)
     **/
    _read_settings(){
        const content = fs.readFileSync(this.path, {encoding: 'utf-8'});
        const objcontent = JSON.parse(content);

        for(const key in objcontent){
            const value = objcontent[key];

            if(this._has_attributes(value)){
                this.set(key, value[VALUE_FIELD], value[WRITEABLE_FIELD]);
                continue;
            } 

            this.set(key, value);
        }
    }

    /**
     * checks if passed value have attributes like writeable and value
     */
    _has_attributes(value){

        // check if value is NOT json
        if(!(typeof value === 'object' || value instanceof Object)){
            return false;
        }

        const keys = JSON.keys(value);
        const writeableIndex = keys.indexOf(WRITEABLE_FIELD);
        const valueIndex     = keys.indexOf(VALUE_FIELD);

        return (
            writeableIndex !== -1 &&  typeof value[WRITEABLE_FIELD] === 'boolean' &&
            valueIndex !== -1
        );
    }
}

/**
 * there is only 1 settings instance allowing modules
 * to change the value and share them live
 */
module.exports = new Settings(SETTINGS_FILE_PATH);
