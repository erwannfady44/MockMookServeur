const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const tagSchema = mongoose.Schema({
    name: {type: String, require: true, unique: true}
});

tagSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Tag', tagSchema);
