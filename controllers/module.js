const User = require('../Models/User');
const Module = require('../Models/module');
const Path = require('../Models/Path');

exports.clone = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then(user => {
            Module.findOne({_id: req.params.idModule})
                .then(module => {
                    let newModule = new Module({
                        idPath: req.params.idPath,
                        idCreator: user._id,
                        title: module.title,
                        description: module.description
                    })
                    newModule.save()
                        .then(() => res.status(201).json())
                        .catch((err) => res.status(500).json({error: err.message}))
                })
                .catch((err) => res.status(404).json({error: err.message}))
        })
        .catch((err) => res.status(401).json({error: err.message}))
}

function cloneResource(id) {

}

// Utile ?
exports.getAll = (req, res, next) => {
    Module.find({})
        .then((modules) => {
            res.status(200).json({modules: modules});
        })
        .catch(error => {
            res.status(500).json({error: error.message});
        })
}

exports.findByKeyWord = (req, res, next) => {
    const keyWords = req.query.keyWords.split(', ')
    const reg = [];
    keyWords.forEach(word => {
        reg.push(new RegExp(word, "i"))
    })
    Module.find({
        $or: [
            {"title": {$all: reg}},
            {"description": {$all: reg}}
        ],
        $nor: [{idPath: req.query.idPath}]
    }).then(modules => {
        const json = []
        modules.forEach(module => {
            json.push({
                idModule: module._id,
                title: module.title,
                description: module.description,
                idPath: module.idPath,
                position: module.position,
                idCreator: module.idCreator,
                date: module.date,
            });
        })
        res.status(200).json({
            json
        })
    })
        .catch(error => res.status(404).json({error: error.message}))
}
