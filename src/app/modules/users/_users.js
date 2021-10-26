const fs   = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const settings = require('../../settings/settings');
const { getLogging, DEBUG } = require('../../logging/logging');


const ENCODING   = settings.get('encoding');
const USERS_FILE = settings.get('usersFile');
const SHELL_FILE = settings.get('shellsfile');
const logging = getLogging(
    path.basename(__filename, '.js', '.ts', '.jsx')
);


class FileAbstruct{
    
    constructor(path, checkDate=true){
        this.path = path;
        this.checkDate = checkDate;
        this.size = 0;

        this._lastDate = null;
        this._getFileStat();
    }

    isUpdated(){
        const stat = fs.statSync(this.path);
        const edited = stat.ctimeMs !== this._lastDate;

        if(edited){ // update the last edited time
            logging.log(`${this.path} file is updated, fetching data again`, DEBUG);
            this._setByStat(stat);
        }
        return edited;
    }

    serialize(content){
        return content;
    }

    _getFileStat(){
        this._setByStat(
            fs.statSync(this.path)
        );
    }

    /**
     * get a stat object and update the class parameters 
     * by that stat object
     */
    _setByStat(stat){
        this.size = stat.size;
        this._lastDate = stat.ctimeMs;
    }

    _getDataFromFile(){
        const content = fs.readFileSync(this.path, {encoding: ENCODING});
        return this.serialize(content);
    }
}

exports.shells = new (class UserShells extends FileAbstruct{

    constructor(path){
        super(path);
        this._shells = [];
    }

    getShells(){
        if(this.isUpdated() || this._shells.length === 0){
            this._shells = this._getDataFromFile();
        }
        return this._shells;
    }

    isValidShell(shellpath){
        const shells = this.getShells();
        return shells.find(s => s === shellpath) != null;
    }

    serialize(content){
        return content.split('\n');
    }

})(SHELL_FILE);

/**
 * exports a ShadowFile class instance
 */
module.exports.shadowfile = new (class ShadowFile extends FileAbstruct{

    constructor(path){
        super(path);
        this._users = [];
    }

    /**
     * return the users from local variable, if the /etc/passwd file
     * has updated, it will retrive the updated data from there and then return based on the given fields
     * 
     * @param {...Array} fields
     * @returns users list as objects
     */
    getUsers(...fields){
        if(this.isUpdated() || this._users.length === 0){
            this._users = this._getDataFromFile();
        }

        if(fields.length !== 0){
            return this._users.map(user => {
                const o = {};
                
                for(const field of fields){
                    o[field] = user[field]
                }
                return o;
            });
        }

        return this._users;
    }

    /**
     * returns an array with 1 object that is the user id, if no user found
     * the function return empty list
     * 
     * @param {int | str} uid
     * */
    getUserByID(uid){
        const users = this.getUsers();
        return users.find(user => user.uid == uid);
    }

    /**
     * gets an array that look like this ['uid', [0, 113], 'name', ['bon', 'root']], and filer based
     * on given params
     * 
     * @param {Array<str, [] | str>} attrs 
     * @returns {Array<Object>}
     */
    search(attrs){
        const users = this.getUsers();
        const entries = Object.entries(attrs);

        return users.filter(user => {
            for(const [key, value] of entries){

                if(value instanceof Array){
                    if(value.some(val => user[key] == val)){
                        return true
                    }
                } else if(user[key] == value){
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * create a user by calling the useradd gnu program,
     * the function takes name, shell, createhome, group, homedir
     * 
     * all the arguments name speak for themeselves, the createhome is 
     * if to add the -m flag
     * 
     * @param {str} name
     * @param {str} shell
     * @param {bool} createhome
     * @param {str} group
     * @param {str} homedir
     * 
     * @returns {Promise(useradd status code)}
     */
    createUser(name, shell, createhome, group=null, homedir=null){
        const useraddargs = [
            name,
            '-s', shell
        ];

        if(createhome){
            useraddargs.push('-m');

            if(homedir !== null){
                useraddargs.push('-d');
                useraddargs.push(homedir);
            }
        }

        if(group !== null){
            useraddargs.push('-G');
            useraddargs.push(group);
        }

        // exit status of useradd can be viewed here: https://linux.die.net/man/8/useradd
        const useradd = spawn('useradd', useraddargs);
        return new Promise((resolve, reject) => {

            useradd.on('close', (code) => {
                if(code === 0){
                    return resolve(code);
                }
                reject(code);
            });

        });
    }

    /**
     * convert the /etc/passwd format to list that contain
     * objects, those objects are the users
     * 
     * @param {str} content 
     * @returns {Array<Object>} users list as objects
     */
    serialize(content){
        const users = [];
        const usersLines = content.split('\n');

        for(const line of usersLines){
            const userInfo  = line.split(':');

            users.push({
                name: userInfo[0],
                uid: userInfo[2],
                gid: userInfo[3],
                comment: userInfo[4],
                home: userInfo[5],
                shell: userInfo[6]
            });
        }
        return users;
    }

})(USERS_FILE);

