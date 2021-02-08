const mongoose = require('mongoose');

const classesSchema = mongoose.Schema({
    idPath: {type: mongoose.Schema.Types.ObjectId, ref: 'Path', require: true},
    idCreator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    title: {type: String, require: true},
    description: {type: String, require: true},
    date: {type: Date, require: true}
});

module.exports = mongoose.model('Classes', classesSchema);
