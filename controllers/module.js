const User = require('../Models/User');
const Resource = require('../Models/Resource');
const Module = require('../Models/Module');
const Path = require('../Models/Path');

exports.addResource = (req, res) => {
    User.findOne({_id: req.body.idUser})
        .then(user => {
            Module.findOne({_id: req.params.idModule})
                .then(module => {
                    if (!module) {
                        res.status(404).json({error: 'Module not found'});
                    } else {
                        Resource.find({idModule: req.params.idModule}).countDocuments()
                            .then(position => {
                                if (!user._id.equals(module.idCreator)) {
                                    res.status(403).json({error: "You're not the owner"});
                                } else {
                                    Path.findOne({_id: module.idPath})
                                        .then(path => {
                                            let resource = new Resource({
                                                idModule: module._id,
                                                idCreator: user._id,
                                                url: req.body.url,
                                                title: req.body.title,
                                                description: req.body.description,
                                                date: Date.now(),
                                                position: position + 1
                                            })
                                            module.date = Date.now();
                                            path.date = Date.now();
                                            user.updateOne({nbResource: user.nbResource+1});
                                            resource.save()
                                                .then(() => module.save()
                                                    .then(() => path.save()
                                                        .then(() => res.status(201).json())
                                                        .catch((err) => res.status(500).json({error: err.message})))
                                                    .catch((err) => res.status(500).json({error: err.message})))
                                                .catch((err) => res.status(500).json({error: err.message}))
                                        })
                                        .catch((error) => res.status(500).json({error: error.message}));
                                }
                            })
                            .catch((err) => res.status(500).json({error: err.message}))
                    }
                })
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

exports.editResource = (req, res) => {
    User.findOne({_id: req.body.idUser})
        .then(user => {
            Module.findOne({_id: req.params.idModule})
                .then(module => {
                    if (!module) {
                        res.status(404).json({error: 'Module not found'});
                    } else {
                        Path.findOne({_id: module.idPath})
                            .then(path => {
                                Resource.findOne({_id: req.params.idResource})
                                    .then(resource => {
                                        if (!resource) {
                                            res.status(404).json({error: 'Resource not found'});
                                        } else {
                                            if (!user._id.equals(resource.idCreator)) {
                                                res.status(403).json({error: "You're not the owner"});
                                            } else {
                                                resource.url = req.body.url;
                                                resource.title = req.body.title;
                                                resource.description = req.body.description;
                                                resource.date = Date.now();
                                                module.date = Date.now();
                                                path.date = Date.now();
                                                resource.save()
                                                    .then(() => module.save()
                                                        .then(() => path.save()
                                                            .then(() => res.status(200).json())
                                                            .catch((err) => res.status(500).json({error: err.message})))
                                                        .catch((err) => res.status(500).json({error: err.message})))
                                                    .catch((err) => res.status(500).json({error: err.message}))
                                            }
                                        }
                                    })
                                    .catch((err) => res.status(500).json({error: err.message}))
                            })
                            .catch((err) => res.status(500).json({error: err.message}))
                    }
                })
                .catch((err) => res.status(500).json({error: err.message}))
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

exports.getOneResource = (req, res) => {
    Module.findOne({_id: req.params.idModule})
        .then(module => {
            if (!module) {
                res.status(404).json({error: 'Module not found'});
            } else {
                Resource.findOne({_id: req.params.idResource})
                    .then(resource => {
                        if (!resource) {
                            res.status(404).json({error: 'Resource not found'});
                        } else {
                            res.status(200).json({
                                idResource: resource._id,
                                idModule: resource.idModule,
                                url: resource.url,
                                title: resource.title,
                                description: resource.description,
                                idCreator: resource.idCreator,
                                date: resource.date,
                                position: resource.position
                            });
                        }
                    })
                    .catch((err) => res.status(500).json({error: err.message}))
            }
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

exports.deleteResource = (req, res) => {
    User.findOne({_id: req.query.idUser})
        .then(user => {
            Module.findOne({_id: req.params.idModule})
                .then(module => {
                    if (!module) {
                        res.status(404).json({error: 'Module not found'});
                    } else {
                        Path.findOne({_id: module.idPath})
                            .then(path => {
                                Resource.findOne({_id: req.params.idResource})
                                    .then(resource => {
                                        if (!resource) {
                                            res.status(404).json({error: 'Resource not found'});
                                        } else {
                                            if (!user._id.equals(resource.idCreator)) {
                                                res.status(403).json({error: "You're not the owner"});
                                            } else {
                                                Resource.deleteOne({_id: resource._id})
                                                    .then(async () => {
                                                        async function changePosition() {
                                                            Resource.find({idModule: module._id})
                                                                .then((resources) => {
                                                                    resources.forEach(resource2 => {
                                                                        if (resource2.position > resource.position) {
                                                                            resource2.position--
                                                                            resource2.save().catch((err) => res.status(500).json({error: err.message}))
                                                                        }
                                                                    })
                                                                })
                                                                .catch((err) => res.status(500).json({error: err.message}))
                                                        }

                                                        await changePosition();

                                                        module.date = Date.now();
                                                        path.date = Date.now();
                                                        user.updateOne({nbResource: user.nbResource-1});
                                                        module.save()
                                                            .then(() => path.save()
                                                                .then(() => res.status(200).json())
                                                                .catch((err) => res.status(500).json({error: err.message})))
                                                            .catch((err) => res.status(500).json({error: err.message}))
                                                    })
                                                    .catch((err) => res.status(500).json({error: err.message}))
                                            }
                                        }
                                    })
                                    .catch((err) => res.status(500).json({error: err.message}))
                            })
                            .catch((err) => res.status(500).json({error: err.message}))
                    }
                })
                .catch((err) => res.status(500).json({error: err.message}))
        })
        .catch((err) => res.status(500).json({error: err.message}))
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
                                            if (!module2) {
                                                res.status(404).json({error: 'Module2 not found'});
                                            } else {
                                                if (!user._id.equals(module2.idCreator)) {
                                                    res.status(403).json({error: "You're not the owner"});
                                                } else {
                                                    Resource.findOne({
                                                        idModule: req.body.idModule2,
                                                        title: resource.title
                                                    })
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
                                                                        }).save()
                                                                            .then(() => {
                                                                                user.updateOne({nbResource: user.nbResource+1});
                                                                                res.status(200).json()
                                                                            })
                                                                            .catch((err) => res.status(500).json({error: err.message}))
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

