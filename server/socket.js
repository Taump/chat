'use strict';
const limitPostWrite = 15; // Количество выводимых постов в чате
const jwt = require('jsonwebtoken');
const config = require('./config');
const MessageModel = require('./models/messages.model');
module.exports = io => {
    io.on('connection', function (socket) {
        socket.join('all');
        socket.on('msg', function (content) {
            content.msg = content.msg.replace(/<[^>]+>/g,'');
            const obj = {
                date: new Date(),
                content: content.msg,
                username: socket.id
            };
            obj.username =  jwt.verify(content.token, config.jwt.secretOrKey,function(err, decoded) {
                return decoded.username;
            });
            if(content.msg!==null){
                MessageModel.create(obj, err =>{
                    if(err) return console.error('MessageModel',err);
                    socket.emit("message",obj);
                    socket.to('all').emit("message",obj);
                });
            }
        });
        socket.on('receiveHistory',()=>{
            MessageModel
                .find({})
                .sort({date: -1})
                .limit(50)
                .sort({date: 1})
                .lean()
                .exec( (err, messages) => {
                    if(!err){
                        socket.emit("history", messages);
                    }
                })
        });
    });
};