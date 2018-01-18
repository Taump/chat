"use strict";

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const mongoose = require('mongoose');
const server = require('http').Server(app);
let router = require('./router');
const io = require('socket.io')(server,{serveClient: true});
const url = 'mongodb://localhost:27017/chat';
mongoose.connect(url,{useMongoClient: true});
mongoose.Promise = require('bluebird');
//ongoose.set('debug', true);
const socket = require('./socket')(io);
const passport = require('passport');
const cookieParser = require('cookie-parser');
const { Strategy } = require('passport-jwt');

const {jwt} = require('./config');

passport.use(new Strategy(jwt,function (jwt_payload, done) {
    if(!jwt_payload){
        return done(false, jwt_payload);
    } else {
        done();
    }
}));

nunjucks.configure('./client/views', {
    autoescape: true,
    express: app
});

app.use('/assets',express.static('./client/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());

server.listen(3000,'0.0.0.0', ()=>{
    console.log('Server started on port 3000');
});


app.use('/', router);
