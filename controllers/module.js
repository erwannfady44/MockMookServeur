const User = require('../Models/User');
const Module = require('../Models/module');
const Path = require('../Models/Path');

exports.add = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            let module = new Module({
                idCreator: user._id,
                title: req.body.title,
                description: req.body.description
            })

            Path.findOne({_id: req.body.idPath})
                .then((path) => {
                    module.idPath = req.body.idPath;
                    module.save()
                        .then(() => res.status(201).json())
                        .catch((err) => res.status(500).json({error: err.message}))
                })
                .catch((err) => res.status(404).json({error: err.message}))
        })
        .catch((err) => res.status(401).json({error: err.message}))
}

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

function cloneRessource(id) {

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
/*
exports.getModules = (req, res, next) => {
    Path.findOne({_id: req.params.idPath})
        .then((path) => {
            Module.find({idPath: path.idPath})
                .then((modules) => {
                    res.status(200).json({modules: modules});
                })
                .catch(error => {
                    res.status(500).json({error: error.message});
                })
        })
        .catch((err) => res.status(404).json({error: err.message}))
}
*/

exports.edit = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Module.findOne({_id: req.params.idModule})
                .then((module) => {
                    if (user._id === module.idCreator) {
                        res.status(403).json();
                    } else {
                        module.title = req.body.title;
                        module.description = req.body.description;
                        module.pseudo = req.body.pseudo;
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

exports.getOne = (req, res, next) => {
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
                        date: module.date
                    });
                })
        })
        .catch(error => {
            res.status(404).json({error: error.message});
        })
}

exports.delete = (req, res, next) => {
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

exports.findByKeyWord = (req, res, next) => {

}
