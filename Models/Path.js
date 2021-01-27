const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const pathSchema = mongoose.Schema({
    idCreator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    titre: {type: String, require: true, unique: true},
    description: {type: String, require: true}
});

pathSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Path', pathSchema);
