const User = require('../Models/User');
const Classes = require('../Models/Classes');
const Path = require('../Models/Path');

exports.add = (req, res, next) => {
    User.findOne({pseudo: req.body.pseudo})
        .then((user) => {
            if (user) {
                let classes = new Classes({
                    idCreator: user._id,
                    title: req.body.title,
                    description: req.body.title
                })

                if (req.body.idPath) {
                    Path.findOne({_id: req.body.idPath})
                        .then((path) => {
                            if (path) {
                                classes.idPath = req.body.idPath;
                                classes.save()
                                    .then(() => res.status(201))
                                    .catch((err) => res.status(500).json({error: err.message}))
                            } else
                                res.status(404);
                        })
                } else {
                    classes.save()
                        .then(() => res.status(201))
                        .catch((err) => res.status(500).json({error: err.message}))
                }
            }
        }).catch((err) => res.status(500).json({error: err.message}))
}

exports.getAll = (req, res, next) => {
    Classes.find({})
        .then((classes) => {
            res.status(200).json({classes: classes});
        })
        .catch(error => {
            res.status(500).json({error: error.message});
        })
}

exports.edit = (req, res, next) => {

}

exports.getOne = (req, res, next) => {

}

exports.delete = (req, res, next) => {

}

exports.findByKeyWord = (req, res, next) => {

}
