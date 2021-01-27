const mongoose = require('mongoose');

const coursSchema = mongoose.Schema({
    idParcours: {type: mongoose.Schema.Types.ObjectId, ref: 'Parcours', require: true},
    idCreateur: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    titre: {type: String, require: true},
    description: {type: String, require: true},
});

module.exports = mongoose.model('Cours', coursSchema);
