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
        .catch((error) => {
            res.status(401).json({error: error.message})
        })
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
        .catch(error => {
            res.status(401).json({error: error.message});
        })
}

exports.edit = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then((path) => {
                    if (user._id !== path.idCreator) {
                        res.status(403).json();
                    } else {
                        path.title = req.body.title;
                        path.description = req.body.description;
                        path.date = Date.now();
                        res.status(200).json();
                    }
                })
                .catch(error => {
                    res.status(404).json({error: error.message});
                })
        })
        .catch(error => {
            res.status(401).json({error: error.message});
        })
}

exports.getOne = (req, res, next) => {
    Path.findOne({_id: req.params.idPath})
        .then((path) => {
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
                                            if (i === modules.length)
                                                res.status(200).json({
                                                    idPath: path._id,
                                                    title: path.title,
                                                    description: path.description,
                                                    idCreator: user_path._id,
                                                    pseudo: user_path.pseudo,
                                                    date: path.date,
                                                    modules: tab
                                                });
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
                        .catch(error => {
                            res.status(405).json({error: error.message});
                        })
                })
        })
        .catch(error => {
            res.status(404).json({error: error.message});
        })
}


exports.delete = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.deleteOne({_id: req.params.idPath})
                .then(path => {
                    if (user._id === path.idCreator) {
                        res.status(403).json();
                    } else {
                        res.status(200).json();
                    }
                })
                .catch(error => {
                    res.status(404).json({error: error.message});
                })
        })
        .catch(error => {
            res.status(401).json({error: error.message});
        })
}

exports.addModule = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            let module = new Module({
                idCreator: user._id,
                title: req.body.title,
                description: req.body.description,
                date: Date.now()
            })

            Path.findOne({_id: req.params.idPath})
                .then((path) => {
                    module.idPath = path._id;
                    module.save()
                        .then(() => res.status(201).json())
                        .catch((err) => res.status(500).json({error: err.message}))
                })
                .catch((err) => res.status(404).json({error: err.message}))
        })
        .catch((err) => res.status(401).json({error: err.message}))
}

exports.editModule = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Module.findOne({_id: req.params.idModule})
                .then((module) => {
                    if (user._id !== module.idCreator) {
                        res.status(403).json();

                    } else {
                        module.title = req.body.title;
                        module.description = req.body.description;
                        module.date = Date.now();
                        res.status(200).json();
                    }
                })
                .catch(error => {
                    res.status(404).json({error: error.message});
                })
        })
        .catch(error => {
            res.status(401).json({error: error.message});
        })
}

exports.deleteModule = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Module.deleteOne({_id: req.params.idModule})
                .then(module => {
                    if (user._id === module.idCreator) {
                        res.status(403).json();
                    } else {
                        res.status(200).json();
                    }
                })
                .catch(error => {
                    res.status(404).json({error: error.message});
                })
        })
        .catch(error => {
            res.status(401).json({error: error.message});
        })
}

exports.getOneModule = (req, res, next) => {
    Module.findOne({_id: req.params.idModule})
        .then((module) => {
            User.findOne({_id: module.idCreator})
                .then(user => {
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
                })
        })
        .catch(error => {
            res.status(404).json({error: error.message});
        })
}

exports.addResource = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then(user => {
            let resource = new Resource({
                idCreator: user._id,
                url: req.body.url,
                title: req.body.title,
                description: req.body.description,
                date: Date.now()
            })

            Module.findOne({_id: req.params.idModule})
                .then(module => {
                    resource.idModule = module._id;
                    resource.save()
                        .then(() => res.status(201).json())
                        .catch((err) => res.status(500).json({error: err.message}))
                })
                .catch((err) => res.status(404).json({error: err.message}))
        })
        .catch((err) => res.status(401).json({error: err.message}))
}

exports.editResource = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then(user => {
            Resource.findOne({_id: req.params.idResource})
                .then(resource => {
                    if (user._id !== resource.idCreator){
                        res.status(403).json()
                    } else {
                        resource.url = req.body.url;
                        resource.title = req.body.title;
                        resource.description = req.body.description;
                        resource.date = Date.now();
                        res.status(200).json();
                    }
                })
                .catch((err) => res.status(404).json({error: err.message}))
        })
        .catch((err) => res.status(401).json({error: err.message}))
}

exports.getOneResource = (req, res, next) => {
    Resource.findOne({_id: req.params.idResource})
        .then(resource => {
            res.status(200).json({
                idResource: resource._id,
                idModule: resource.idModule,
                url: resource.url,
                title: resource.title,
                description: resource.description,
                date: resource.date,
                position: resource.position
            });
        })
        .catch((err) => res.status(404).json({error: err.message}))
}

exports.findByKeyWord = (req, res, next) => {

}
