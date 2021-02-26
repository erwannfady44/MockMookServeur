const User = require('../Models/User');
const Resource = require('../Models/Resource');
const Module = require('../Models/module');
const Path = require('../Models/Path');

exports.clone = (req, res) => {
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

exports.cloneResource = (req, res) => {
    User.findOne({_id: req.body.idUser})
        .then(user => {
            Module.findOne({_id: req.params.idModule})
                .then(module => {
                    if (!module) {
                        res.status(404).json({error: "Module not found"})
                    } else {
                        Resource.findOne({_id: req.params.idResource})
                            .then(resource => {
                                if (!resource) {
                                    res.status(404).json({error: "Resource not found"})
                                } else {
                                    Module.findOne({_id: req.body.idModule2})
                                        .then(module2 => {
                                            if (!module2){
                                                res.status(404).json({error: 'Module2 not found'});
                                            } else {
                                                if (!user._id.equals(module2.idCreator)){
                                                    res.status(403).json({error: "You're not the owner"});
                                                } else {
                                                    Resource.findOne({idModule: req.body.idModule2, title: resource.title})
                                                        .then(exist => {
                                                            if (exist) {
                                                                res.status(409).json({error: "Resource already exists"})
                                                            } else {
                                                                Resource.find({idModule: req.body.idModule2}).count()
                                                                    .then(position => {
                                                                        new Resource({
                                                                            idModule: req.body.idModule2,
                                                                            idCreator: user._id,
                                                                            url: resource.url,
                                                                            title: resource.title,
                                                                            description: resource.description,
                                                                            date: new Date(),
                                                                            position: position + 1
                                                                        }).save().catch((err) => res.status(500).json({error: err.message}))
                                                                    })
                                                                    .catch((err) => res.status(500).json({error: err.message}))
                                                            }
                                                        })
                                                        .catch((err) => res.status(500).json({error: err.message}))
                                                }
                                            }
                                        })
                                        .catch((err) => res.status(500).json({error: err.message}))
                                }
                            })
                            .catch((err) => res.status(500).json({error: err.message}))
                    }
                })
                .catch((err) => res.status(500).json({error: err.message}))
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

// Utile ?
exports.getAll = (req, res) => {
    Module.find({})
        .then((modules) => {
            res.status(200).json({modules: modules});
        })
        .catch(error => res.status(500).json({error: error.message}))
}

exports.findByKeyWord = (req, res) => {
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
        .catch(error => res.status(500).json({error: error.message}))
}
