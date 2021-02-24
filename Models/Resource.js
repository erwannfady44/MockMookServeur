const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const resourceSchema = mongoose.Schema({
    idModule: {type: mongoose.Schema.Types.ObjectId, ref: 'module', require: true},
    idCreator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    url: {type: String, require: true, unique: true},
    title: {type: String, require: true},
    description: {type: String, require: true},
    date: {type: Date, require: true}
});

resourceSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Resource', resourceSchema);
