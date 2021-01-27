const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const resourceSchema = mongoose.Schema({
    idClasses: {type: mongoose.Schema.Types.ObjectId, ref: 'Classes', require: true},
    url: {type: String, require: true, unique: true},
    title: {type: String, require: true},
    description: {type: String, require: true}
});

resourceSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Resource', resourceSchema);
