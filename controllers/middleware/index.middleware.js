
const cors = require('cors');
const { networkInterfaces } = require('os');

const mongoose = require('mongoose');
const Config = (process.env.SWEET == "dev") ? require('../../config/config.dev.json') : require('../../config/config.json');
let data = { results : [] };

const functions = {
    network : () => {
        if(Config.mode == "developer"){        
            const nets = networkInterfaces();
            Config.front.map((item) => {
                for (const name of Object.keys(nets)) {
                    for (const net of nets[name]) {
                        (net.family === 'IPv4' && !net.internal) ? data.results.push(item.protocal + '://' + net.address + ':' + item.port) : undefined;
                    }
                }

                data.results.push(`${ (typeof item.protocal == 'string') ? item.protocal + '://' : '' }${ (typeof item.host == 'string') ? item.host : '127.0.0.1' }${ (typeof item.port == 'string' || typeof item.port == 'number' ) ? ':' + item.port : '' }`);
            });
        }else{
            Config.front.map((item) => {
                data.results.push(`${ (typeof item.protocal == 'string') ? item.protocal + '://' : '' }${ (typeof item.host == 'string') ? item.host : '127.0.0.1' }${ (typeof item.port == 'string' || typeof item.port == 'number' ) ? ':' + item.port : '' }`);
            });
        }
    },
    _cors : (app) => {
        console.log(data.results);
        app.use(cors({ origin: data.results, credentials: true }));
    },
    _mongoose : () => {
        const DataBase = `${ (typeof Config.db.protocal == 'string') ? Config.db.protocal + '://' : '' }${ (typeof Config.db.address == 'string') ? Config.db.address : '127.0.0.1' }${ (typeof Config.db.port == 'string' || typeof Config.db.port == 'number') ? ':' + Config.db.port : '' }${ (typeof Config.db.collection == 'string' || typeof Config.db.collection == 'number') ? '/' + Config.db.collection : '' }`;
        const Options = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
        mongoose.Promise = global.Promise;
        mongoose.connect(DataBase, Options).then(() => {
            console.log('Connected DataBase');
        }).catch((err) => {
            console.error({ message : "Not Connected DataBase", error : err });
        });
    },
    _socket : (app) => {
        //app.io = require('socket.io')();
        //app.io.on('connection', (socket) => { console.log('hello') });
    },
    _jwt : (app) => {
        app.set('jwt-secret', Config.jwt.secret);
        app.set('jwt-resecret', Config.jwt.resecret);
    },
};

const Middleware = {
    app : async (object) => {
        functions.network();
        functions._cors(object.app);
        functions._mongoose();
        functions._socket(object.app);
        functions._jwt(object.app);
    }
};

module.exports = Middleware;
