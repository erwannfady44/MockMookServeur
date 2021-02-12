const User = require('../Models/User');
const Classes = require('../Models/Classes');
const Path = require('../Models/Path');

exports.add = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            let classes = new Classes({
                idCreator: user._id,
                title: req.body.title,
                description: req.body.title
            })

            Path.findOne({_id: req.body.idPath})
                .then((path) => {
                    classes.idPath = req.body.idPath;
                    classes.save()
                        .then(() => res.status(201).json())
                        .catch((err) => res.status(500).json({error: err.message}))
                })
                .catch((err) => res.status(404).json({error: err.message}))
        }).catch((err) => res.status(401).json({error: err.message}))
}

// Utile ?
exports.getAll = (req, res, next) => {
    Classes.find({})
        .then((classes) => {
            res.status(200).json({classes: classes});
        })
        .catch(error => {
            res.status(500).json({error: error.message});
        })
}
/*
exports.getClasses = (req, res, next) => {
    Path.findOne({_id: req.params.idPath})
        .then((path) => {
            Classes.find({idPath: path.idPath})
                .then((classes) => {
                    res.status(200).json({classes: classes});
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
            Classes.findOne({_id: req.params.idClasses})
                .then((classe) => {
                    if (user._id === classe.idCreator) {
                        res.status(403).json();
                    } else {
                        classe.title = req.body.title;
                        classe.description = req.body.description;
                        classe.pseudo = req.body.pseudo;
                        classe.date = Date.now();
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
    Classes.findOne({_id: req.params.idClasses})
        .then((classe) => {
            User.findOne({_id: classe.idCreator})
                .then(user => {
                    res.status(200).json({
                        idClasses: classe.idClasses,
                        idPath: classe.idPath,
                        title: classe.title,
                        description: classe.description,
                        idCreator: classe.idCreator,
                        pseudo: user.pseudo,
                        date: classe.date
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
            Classes.deleteOne({_id: req.params.idClasses})
                .then(classe => {
                    if (user._id === classe.idCreator) {
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
