const mongoose = require('mongoose');

const tagAssociationSchema = mongoose.Schema({
    idPath: {type: mongoose.Schema.Types.ObjectId, ref: 'Path', require: true},
    idTag: {type: mongoose.Schema.Types.ObjectId, ref: 'Tag', require: true},
});

module.exports = mongoose.model('TagAssociation', tagAssociationSchema);
