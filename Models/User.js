const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    pseudo: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    status: {type: Number, require: true}
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
