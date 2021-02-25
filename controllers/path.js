const User = require('../Models/User');
const Resource = require('../Models/Resource');
const Module = require('../Models/module');
const Path = require('../Models/Path');

exports.add = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            let path = new Path({
                idCreator: user._id,
                title: req.body.title,
                description: req.body.description,
                date: Date.now()
            })
            path.save()
                .then(() => res.status(201).json())
                .catch((error) => res.status(500).json({error: error.message}))

        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.getAll = (req, res, next) => {
    Path.find({}).sort({date: -1})
        .then((paths) => {
            let json = [];
            // TODO : Optimiser
            let i = 0;
            paths.forEach(path => {
                User.findOne({_id: path.idCreator})
                    .then(user => {
                        json.push({
                            idPath: path._id,
                            title: path.title,
                            description: path.description,
                            idCreator: user._id,
                            pseudo: user.pseudo,
                            date: path.date
                        });
                        i++;
                        if (i === paths.length)
                            res.status(200).json({json});
                    })
            })

        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.edit = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then((path) => {
                    if (path) {
                        if (!user._id.equals(path.idCreator)) {
                            res.status(403).json({error: "You're not the owner"});
                        } else {
                            path.title = req.body.title;
                            path.description = req.body.description;
                            path.date = Date.now();
                            path.save()
                                .then(() => res.status(200).json())
                                .catch((err) => res.status(500).json({error: err.message}))
                        }
                    } else res.status(404).json({error: 'Path not found'});
                })
                .catch((error) => res.status(500).json({error: error.message}));
        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.getOne = (req, res, next) => {
    Path.findOne({_id: req.params.idPath})
        .then((path) => {
            if (path) {
                User.findOne({_id: path.idCreator})
                    .then((user_path) => {
                        Module.find({idPath: req.params.idPath})
                            .then((modules) => {
                                if (modules.length !== 0) {
                                    let tab = [];
                                    // TODO : Optimiser
                                    let i = 0;
                                    modules.forEach(module => {
                                        User.findOne({_id: module.idCreator})
                                            .then((user) => {
                                                tab.push({
                                                    idModule: module._id,
                                                    title: module.title,
                                                    description: module.description,
                                                    idCreator: user._id,
                                                    pseudo: user.pseudo,
                                                    date: module.date,
                                                    position: module.position
                                                })
                                                i++;
                                                if (i === modules.length) {
                                                    res.status(200).json({
                                                        idPath: path._id,
                                                        title: path.title,
                                                        description: path.description,
                                                        idCreator: user_path._id,
                                                        pseudo: user_path.pseudo,
                                                        date: path.date,
                                                        modules: tab
                                                    });
                                                }
                                            })
                                    })
                                } else {
                                    res.status(200).json({
                                        idPath: path._id,
                                        title: path.title,
                                        description: path.description,
                                        idCreator: user_path._id,
                                        pseudo: user_path.pseudo,
                                        date: path.date
                                    })
                                }
                            })
                            .catch((error) => res.status(500).json({error: error.message}));
                    })
            } else res.status(404).json({error: 'Path not found'});
        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.delete = (req, res, next) => {
    User.findOne({_id: req.query.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then(path => {
                    if (path) {
                        if (!user._id.equals(path.idCreator)) {
                            res.status(403).json({error: "You're not the owner"});
                        } else {
                            Path.deleteOne({_id: path._id})
                                .then(() => res.status(200).json())
                                .catch((err) => res.status(500).json({error: err.message}))
                        }
                    } else res.status(404).json({error: 'Path not found'});
                })
                .catch(error => res.status(500).json({error: error.message}));
        })
        .catch(error => res.status(500).json({error: error.message}));
}

exports.addModule = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then((path) => {
                    if (path) {
                        Module.find({idPath: req.params.idPath}).count()
                            .then(position => {
                                if (!user._id.equals(path.idCreator)) {
                                    res.status(403).json({error: "You're not the owner"});
                                } else {
                                    let module = new Module({
                                        idPath: path._id,
                                        idCreator: user._id,
                                        title: req.body.title,
                                        description: req.body.description,
                                        date: Date.now(),
                                        position: position
                                    })
                                    path.date = Date.now();
                                    module.save()
                                        .then(() => path.save()
                                            .then(() => res.status(201).json())
                                            .catch((err) => res.status(500).json({error: err.message})))
                                        .catch((err) => res.status(500).json({error: err.message}))
                                }
                            })
                            .catch((err) => res.status(500).json({error: err.message}))
                    } else res.status(404).json({error: 'Path not found'});
                })
                .catch((err) => res.status(500).json({error: err.message}))
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

exports.editModule = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then(path => {
                    if (path) {
                        Module.findOne({_id: req.params.idModule})
                            .then((module) => {
                                if (module) {
                                    if (!user._id.equals(module.idCreator)) {
                                        res.status(403).json({error: "You're not the owner"});
                                    } else {
                                        module.title = req.body.title;
                                        module.description = req.body.description;
                                        module.date = Date.now();
                                        path.date = Date.now();
                                        module.save()
                                            .then(() => path.save()
                                                .then(() => res.status(200).json())
                                                .catch((err) => res.status(500).json({error: err.message})))
                                            .catch((err) => res.status(500).json({error: err.message}))
                                    }
                                } else res.status(404).json({error: 'Module not found'});
                            })
                            .catch((error) => res.status(500).json({error: error.message}));
                    } else res.status(404).json({error: 'Path not found'});
                })
                .catch((error) => res.status(500).json({error: error.message}));
        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.deleteModule = (req, res, next) => {
    User.findOne({_id: req.query.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then(path => {
                    if (path) {
                        Module.findOne({_id: req.params.idModule})
                            .then(module => {
                                if (module) {
                                    if (!user._id.equals(module.idCreator)) {
                                        res.status(403).json({error: "You're not the owner"});
                                    } else {
                                        Module.deleteOne({_id: module._id})
                                            .then(() => {
                                                path.date = Date.now();
                                                path.save()
                                                    .then(() => res.status(200).json())
                                                    .catch((err) => res.status(500).json({error: err.message}))
                                            })
                                            .catch((err) => res.status(500).json({error: err.message}))
                                    }
                                } else res.status(404).json({error: 'Module not found'});
                            })
                            .catch((error) => res.status(500).json({error: error.message}));
                    } else res.status(404).json({error: 'Path not found'});
                })
                .catch((error) => res.status(500).json({error: error.message}));
        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.getOneModule = (req, res, next) => {
    Path.findOne({_id: req.params.idPath})
        .then(path => {
            if (path) {
                Module.findOne({_id: req.params.idModule})
                    .then((module) => {
                        if (module) {
                            User.findOne({_id: module.idCreator})
                                .then(user => {
                                    Resource.find({idModule: req.params.idModule})
                                        .then(resources => {
                                            if (resources.length !== 0) {
                                                let tab = [];
                                                let i = 0;
                                                resources.forEach(resource => {
                                                    tab.push({
                                                        idResource: resource._id,
                                                        idModule: resource.idModule,
                                                        url: resource.url,
                                                        title: resource.title,
                                                        description: resource.description,
                                                        date: resource.date,
                                                        position: resource.position
                                                    })
                                                    i++;
                                                    if (i === resources.length) {
                                                        res.status(200).json({
                                                            idModule: module._id,
                                                            idPath: module.idPath,
                                                            title: module.title,
                                                            description: module.description,
                                                            idCreator: module.idCreator,
                                                            pseudo: user.pseudo,
                                                            date: module.date,
                                                            position: module.position,
                                                            resources: tab
                                                        });
                                                    }
                                                })
                                            } else {
                                                res.status(200).json({
                                                    idModule: module._id,
                                                    idPath: module.idPath,
                                                    title: module.title,
                                                    description: module.description,
                                                    idCreator: module.idCreator,
                                                    pseudo: user.pseudo,
                                                    date: module.date,
                                                    position: module.position
                                                });
                                            }
                                        })
                                        .catch((error) => res.status(500).json({error: error.message}));
                                })
                        } else res.status(404).json({error: 'module not found'});
                    })
                    .catch((error) => res.status(500).json({error: error.message}));
            } else res.status(404).json({error: 'Path not found'});
        })
}

exports.addResource = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then(user => {
            Module.findOne({_id: req.params.idModule})
                .then(module => {
                    if (module) {
                        Resource.find({idModule: req.params.idModule}).count()
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
                                                position: position
                                            })
                                            module.date = Date.now();
                                            path.date = Date.now();
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
                    } else res.status(404).json({error: 'module not found'});
                })
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

exports.editResource = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then(user => {
            Module.findOne({_id: req.params.idModule})
                .then(module => {
                    if (module) {
                        Path.findOne({_id: module.idPath})
                            .then(path => {
                                Resource.findOne({_id: req.params.idResource})
                                    .then(resource => {
                                        if (resource) {
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
                                        } else res.status(404).json({error: 'resource not found'});
                                    })
                                    .catch((err) => res.status(500).json({error: err.message}))
                            })
                            .catch((err) => res.status(500).json({error: err.message}))
                    } else res.status(404).json({error: 'module not found'});
                })
                .catch((err) => res.status(500).json({error: err.message}))
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

exports.getOneResource = (req, res, next) => {
    Module.findOne({_id: req.params.idModule})
        .then(module => {
            if (module) {
                Resource.findOne({_id: req.params.idResource})
                    .then(resource => {
                        if (resource) {
                            res.status(200).json({
                                idResource: resource._id,
                                idModule: resource.idModule,
                                url: resource.url,
                                title: resource.title,
                                description: resource.description,
                                date: resource.date,
                                position: resource.position
                            });
                        } else res.status(404).json({error: 'resource not found'});
                    })
                    .catch((err) => res.status(500).json({error: err.message}))
            } else res.status(404).json({error: 'module not found'});
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

exports.deleteResource = (req, res, next) => {
    User.findOne({_id: req.query.idUser})
        .then(user => {
            Module.findOne({_id: req.params.idModule})
                .then(module => {
                    if (module) {
                        Path.findOne({_id: module.idPath})
                            .then(path => {
                                Resource.findOne({_id: req.params.idResource})
                                    .then(resource => {
                                        if (resource) {
                                            if (!user._id.equals(resource.idCreator)) {
                                                res.status(403).json({error: "You're not the owner"});
                                            } else {
                                                Resource.deleteOne({_id: resource._id})
                                                    .then(() => {
                                                        module.date = Date.now();
                                                        path.date = Date.now();
                                                        module.save()
                                                            .then(() => path.save()
                                                                .then(() => res.status(200).json())
                                                                .catch((err) => res.status(500).json({error: err.message})))
                                                            .catch((err) => res.status(500).json({error: err.message}))
                                                    })
                                                    .catch((err) => res.status(500).json({error: err.message}))
                                            }
                                        } else res.status(404).json({error: 'resource not found'});
                                    })
                                    .catch((err) => res.status(500).json({error: err.message}))
                            })
                            .catch((err) => res.status(500).json({error: err.message}))
                    } else res.status(404).json({error: 'module not found'});
                })
                .catch((err) => res.status(500).json({error: err.message}))
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

exports.findByKeyWord = (req, res, next) => {
    const keyWords = req.query.keyWords.split(', ')
    const reg = [];
    keyWords.forEach(word => {
        reg.push(new RegExp(word, "i"))
    })
    Path.find({
        $or: [
            {"title": {$all: reg}},
            {"description": {$all: reg}}
        ],
        $nor: [{idPath: req.query.idPath}]
    }).then(paths => {
        const json = []
        paths.forEach(path => {
            json.push({
                idPath: path._id,
                title: path.title,
                description: path.description,
                idCreator: path.idCreator,
                date: path.date
            });
        })
        res.status(200).json();
    })
        .catch(error => res.status(500).json({error: error.message}))
}

exports.cloneModule = async (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then(path => {
                    if (path) {
                    Module.findOne({_id: req.params.idModule})
                        .then((module) => {
                            if (module) {
                                //vérification que le module n'existe pas déjà dans le parcours
                                Module.findOne({idPath: req.params.idPath, title: module.title})
                                    .then((exist) => {
                                        if (exist)
                                            res.status(409).json({error: 'module already exists'});
                                        else {
                                            Module.find({idPath: req.params.idPath}).count()
                                                .then((position) => {
                                                    const newModule = new Module({
                                                        idPath: req.params.idPath,
                                                        idCreator: user._id,
                                                        title: module.title,
                                                        description: module.description,
                                                        date: new Date(),
                                                        position: position,
                                                    }).save().catch((err) => res.status(500).json({error: err.message}))
                                                    //récupération de l'id du module
                                                    Module.findOne({idPath: req.params.idPath, position: position})
                                                        .then(newModule => {
                                                            //récupération de la position
                                                            Resource.find({idModule: module._id})
                                                                .then(async position => {
                                                                    async function cloneResources() {
                                                                        Resource.find({idModule: module._id})
                                                                            .then((resources) => {
                                                                                resources.forEach(resource => {
                                                                                    new Resource({
                                                                                        idModule: newModule._id,
                                                                                        idCreator: user._id,
                                                                                        url: resource.url,
                                                                                        title: resource.title,
                                                                                        description: resource.description,
                                                                                        date: new Date(),
                                                                                        position: position++
                                                                                    }).save().catch((err) => res.status(500).json({error: err.message}))

                                                                                })
                                                                            })
                                                                    }

                                                                    await cloneResources();
                                                                    Path.findOne({_id: module.idPath})
                                                                        .then(path => {
                                                                            path.updateOne({date: new Date()})
                                                                                .then(() => res.status(200).json({}))
                                                                                .catch((err) => res.status(500).json({error: err.message}))
                                                                        })
                                                                })
                                                        })
                                                })
                                        }
                                    })
                            } else res.status(404).json({error: 'module not found'});
                        })
                    } else res.status(404).json({error: 'path not found'});

                }).catch((err) => res.status(500).json({error: err.message}))
        }).catch((err) => res.status(500).json({error: err.message}))

}

