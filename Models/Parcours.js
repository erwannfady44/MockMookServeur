const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const parcoursSchema = mongoose.Schema({
    idCreateur: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    titre: {type: String, require: true, unique: true},
    description: {type: String, require: true}
});

parcoursSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Parcours', parcoursSchema);
