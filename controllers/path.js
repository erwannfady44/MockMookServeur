const User = require('../Models/User');
const Classes = require('../Models/Classes');
const Path = require('../Models/Path');

exports.add = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            if (user.status === 0) {
                res.status(403).json({error: "Student cannot create Paths"});
            } else {
                let path = new Path({
                    idCreator: user._id,
                    title: req.body.title,
                    description: req.body.description,
                    date: Date.now()
                })
                path.save()
                    .then(() => res.status(201).json())
                    .catch((error) => res.status(500).json({error: error.message}))

            }
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
                            idUser: user._id,
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
            if (user.status === 0) {
                res.status(403).json({error: "Student cannot edit Paths"});
            } else {
                Path.findOne({_id: req.params.idPath})
                    .then((path) => {
                        path.title = req.body.title;
                        path.description = req.body.description;
                        path.date = Date.now();
                        res.status(200).json();
                    })
                    .catch(error => {
                        res.status(404).json({error: error.message});
                    })
            }
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
                    Classes.find({idPath: req.params.idPath})
                        .then((classes) => {
                            if (classes.length !== 0) {
                                let tab = [];
                                // TODO : Optimiser
                                let i = 0;
                                classes.forEach(classe => {
                                    User.findOne({_id: classe.idCreator})
                                        .then((user) => {
                                            tab.push({
                                                idClasses: classe._id,
                                                title: classe.title,
                                                description: classe.description,
                                                date: classe.date,
                                                idUser: user._id,
                                                pseudo: user.pseudo
                                            })
                                            i++;
                                            if (i === classes.length - 1)
                                                res.status(200).json({
                                                    idPath: path._id,
                                                    title: path.title,
                                                    description: path.description,
                                                    idUser: user_path._id,
                                                    pseudo: user_path.pseudo,
                                                    date: path.date,
                                                    classes: tab
                                                });
                                        })
                                })
                            } else {
                                res.status(200).json({
                                    idPath: path._id,
                                    title: path.title,
                                    description: path.description,
                                    idUser: user_path._id,
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
            if (user.status === 0) {
                res.status(403).json({error: "Student cannot delete Paths"});
            } else {
                Path.deleteOne({_id: req.params.idPath})
                    .then(() => {
                        res.status(200).json();
                    })
                    .catch(error => {
                        res.status(404).json({error: error.message});
                    })
            }
        })
        .catch(error => {
            res.status(401).json({error: error.message});
        })
}

exports.findByKeyWord = (req, res, next) => {

}
