const asyncLib = require('async');

const Tag = require('../Models/Tag');
const TagAssociation = require('../Models/TagAssociation');
const Path = require('../Models/Path');

exports.findByKeyWords = (req, res) => {
    const keyWords = req.query.keyWords.split(' ')
    const reg = [];

    keyWords.forEach(word => {
        if (word !== "")
            reg.push(new RegExp(word, "i"))
    });

    if (req.query.idPath) {
        Path.findOne({_id: req.query.idPath})
            .then(path => {
                 found(path)
            })
    } else
        found(null);

    function found(path) {
        Tag.find({
            "name": {$all: reg},
        }).then(async tags => {
            let json = []
            for (const tag of tags) {
                if (path) {
                    const t = await searchTagAssociation(tag);
                    if (t)
                        json.push(t);
                } else
                    json.push(tag);
            }

            async function searchTagAssociation(tag) {
                return new Promise(resolve => {
                    TagAssociation.findOne({
                        idPath: path._id,
                        idTag: tag._id
                    }).then(exist => {
                        if (!exist)
                            resolve(tag);
                        else
                            resolve(null);
                    })
                })
            }

            res.status(200).json(json);
        });
    }
}
