const User = require('../Models/User');
const Classes = require('../Models/Classes');
const Path = require('../Models/Path');

exports.add = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            if (user.status === 0) {
                res.status(403).json({error: "Student cannot create Path"});
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
            res.status(500).json({error: error.message})
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
                            title: path.title,
                            description: path.description,
                            pseudo: user.pseudo,
                            idPath: path._id
                        });
                        i++;
                        if (i === paths.length)
                            res.status(200).json({json});
                    })
            })

        })
        .catch(error => {
            res.status(500).json({error: error.message});
        })
}

exports.edit = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.body.idPath})
                .then((path) => {
                    path.title = req.body.title;
                    path.description = req.body.description;
                    res.status(200).json();
                })
                .catch(error => {
                    res.status(404).json({error: error.message});
                })
        })
        .catch(error => {
            res.status(403).json({error: error.message});
        })
}

exports.getOne = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.body.idPath})
                .then((path) => {
                    User.findOne({pseudo: path.idCreator})
                        .then((pseudo) => {
                            res.status(200).json({
                                idPath: path.idPath,
                                title: path.title,
                                description: path.description,
                                pseudo: pseudo
                            });
                        })
                        .catch(error => {
                            res.status(405).json({error: error.message});
                        })
                })
                .catch(error => {
                    res.status(404).json({error: error.message});
                })
        })
        .catch(error => {
            res.status(403).json({error: error.message});
        })
}

exports.delete = (req, res, next) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.deleteOne({_id: req.body.idPath})
                .then(() => {
                    res.status(200).json();
                })
                .catch(error => {
                    res.status(404).json({error: error.message});
                })
        })
        .catch(error => {
            res.status(403).json({error: error.message});
        })
}

exports.findByKeyWord = (req, res, next) => {

}