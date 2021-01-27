const mongoose = require('mongoose');

const coursSchema = mongoose.Schema({
    idPath: {type: mongoose.Schema.Types.ObjectId, ref: 'Path', require: true},
    idCreator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    title: {type: String, require: true},
    description: {type: String, require: true},
});

module.exports = mongoose.model('Classes', coursSchema);
