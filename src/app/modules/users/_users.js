const fs   = require('fs');
const path = require('path');

const settings = require('../../settings/settings');
const { getLogging, DEBUG } = require('../../logging/logging');


const ENCODING   = settings.get('encoding');
const USERS_FILE = settings.get('usersFile');
const logging = getLogging(
    path.basename(__filename, '.js', '.ts', '.jsx')
);


class UsersFileAbstruct{
    
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
}

/**
 * exports a ShadowFile class instance
 */
module.exports.shadowfile = new (class ShadowFile extends UsersFileAbstruct{

    constructor(path){
        super(path);
        this._users = [];
    }

    /**
     * return the users from local variable, if the /etc/passwd file
     * has updated, it will retrive the updated data from there and then return based on the given fields
     * 
     * @returns users list as objects
     */
    getUsers(...fields){
        if(this.isUpdated() || this._users.length === 0){
            this._users = this._getUsersFromFile();
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
        return users.filter(user => user.uid == uid);
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
     * convert the /etc/passwd format to list that contain
     * objects, those objects are the users
     * 
     * @param {str} content 
     * @returns users list as objects
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

    _getUsersFromFile(){
        const content = fs.readFileSync(this.path, {encoding: ENCODING});
        return this.serialize(content);
    }
})(USERS_FILE);

