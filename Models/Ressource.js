const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const ressourceSchema = mongoose.Schema({
    idCours: {type: mongoose.Schema.Types.ObjectId, ref: 'Cours', require: true},
    url: {type: String, require: true, unique: true},
    titre: {type: String, require: true},
    description: {type: String, require: true}
});

ressourceSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Ressource', ressourceSchema);
