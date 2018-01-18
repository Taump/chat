'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const UsersSchema = new Schema({
    username: {type: String},
    password: {type: String},
    addedAt: {type: Date, default: Date.now}
},{
    versionKey: false,
    collection: "UsersCollection"
});
UsersSchema.pre('save',function (next) {
    if(this.isModified('password') || this.isNew()){
        this.password = bcrypt.hashSync(this.password, 12);
        next();
    }
});
module.exports  = mongoose.model('UsersModel',UsersSchema);