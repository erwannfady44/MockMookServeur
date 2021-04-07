const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    pseudo: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    lastConnection: {type: Date, require:true},
    dateJoined: {type: Date, require: true},
    nbPath: {type: Number, default: 0},
    nbModule: {type:Number, default: 0},
    nbResource: {type:Number, default: 0},
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
