const fs = require('fs');

const settings = require('../settings/settings');


const ENCODING = settings.get('encoding');
const LOGGING_FILE = settings.get('loggingfile');


exports.CARITICAL = CRITICAL = 50;
exports.ERROR   = ERROR   = 40;
exports.WARNING = WARNING = 30;
exports.INFO  = INFO  = 10;
exports.DEBUG = DEBUG = 0;

/* default formatter, can be changed (not recommanded) */
exports.fmt = FMT = (message, level, modulename) => {
    const date = new Date().toLocaleTimeString();
    return `[${date}] [${modulename}] [${level}] ${message}`;
};


class Logging{

    constructor(modulename, formatter, level, path){
        this.name  = modulename;
        this.fmt   = formatter;
        this.level = level;
        this.path  = path;
    };

    /**
     * logging the message, if the level is heigher
     * then what defined in the Logging object
     * 
     * @param {str} message 
     * @param {int} level 
     */
    log = (message, level=INFO) => {
        if(level <= this.level){
            const formatted = this.fmt(message, this.level, this.name);

            console.log(formatted);
            this.write(formatted);
        }
    };

    write = (message) => {
        fs.open(this.path, 'a', 664, (err, fd) => {
            if(err) throw err;

            fs.writeSync(fd, message, null);
            fs.closeSync(fd);
        });
    };

    _loggingMiddleware = (req, res, next) => {
        const url = `${req.protocol}://${req.hostname}${req.path}`;
        this.log(`[${req.method}] ${url}`);
    
        next();
    };
};


/**
 * create a Logging object with the global default values
 * 
 * @param {str} name 
 * @param {int} level 
 * @param {callback} format 
 * @returns {Logging instance}
 */
exports.getLogging = (name, level=INFO, format=FMT) => {
    return new Logging(
        name, 
        format, 
        level, 
        LOGGING_FILE
    );
};

