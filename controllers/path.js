const asyncLib = require('async');

const User = require('../Models/User');
const Resource = require('../Models/Resource');
const Module = require('../Models/module');
const Path = require('../Models/Path');
const Tag = require('../Models/Tag');
const TagAssociation = require('../Models/TagAssociation');


exports.add = (req, res) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            let path = new Path({
                idCreator: user._id,
                title: req.body.title,
                description: req.body.description,
                date: Date.now()
            })
            path.save()
                .then(async () => {
                    if (req.body.tags) {
                        for (let tag of req.body.tags) {
                            await addTag(tag);
                        }
                        res.status(201).json();

                        async function addTag(tag) {
                            return new Promise(resolve => {
                                Tag.findOne({name: tag.name})
                                    .then(t => {
                                        // si le tag n'existe pas
                                        if (!t) {
                                            t = new Tag({name: tag.name}).save()
                                                .then((t) => {
                                                    TagAssociation.findOne({
                                                        idPath: path._id,
                                                        idTag: t._id
                                                    }).then(tagAssociation => {
                                                        if (!tagAssociation) {
                                                            new TagAssociation({
                                                                idTag: t._id,
                                                                idPath: path._id
                                                            }).save().then(() => resolve())
                                                        }
                                                    })
                                                })
                                        } else {
                                            TagAssociation.findOne({
                                                idPath: path._id,
                                                idTag: t._id
                                            }).then(tagAssociation => {
                                                if (!tagAssociation) {
                                                    new TagAssociation({
                                                        idTag: t._id,
                                                        idPath: path._id
                                                    }).save().then(() => resolve())
                                                }
                                            })
                                        }
                                    })
                            })

                        }
                    }
                })
                .catch((error) => res.status(500).json({error: error.message}))

        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.getAll = (req, res) => {
    Path.find({}).sort({date: -1})
        .then(async (paths) => {
            let json = [];

            for (const path of paths) {
                json.push(await get(path));
            }

            async function get(path) {
                return new Promise(resolve => {
                    User.findOne({_id: path.idCreator})
                        .then(user => {
                            const jsonTags = [];

                            TagAssociation.find({idPath: path._id})
                                .then(async tags => {
                                    for (const tag of tags) {
                                        jsonTags.push(await getTagName(tag))
                                    }
                                    resolve({
                                        idPath: path._id,
                                        title: path.title,
                                        description: path.description,
                                        idCreator: user._id,
                                        pseudo: user.pseudo,
                                        date: path.date,
                                        tags: jsonTags
                                    });

                                    async function getTagName(tagAssociation) {
                                        return new Promise(resolve => {
                                            Tag.findOne({_id: tagAssociation.idTag})
                                                .then((tag) => resolve(tag))
                                                .catch(error => res.status(500).json({error: error.message}))
                                        });
                                    }
                                })
                        })
                })
            }

            res.status(200).json({json});

        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.edit = (req, res) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then((path) => {
                    if (!path) {
                        res.status(404).json({error: 'Path not found'});
                    } else {
                        if (!user._id.equals(path.idCreator)) {
                            res.status(403).json({error: "You're not the owner"});
                        } else {
                            let newPath = req.body.path;
                            path.title = newPath.title;
                            path.description = newPath.description
                            path.date = Date.now();
                            Module.find({idPath: path._id})
                                .then(modules => {
                                    modules.forEach(module => {
                                        //TODO: refaire à la main
                                        newPath.modules.findOne({_id: module._id})
                                            .then(newModule => {
                                                if (newModule) {
                                                    if (module.title !== newModule.title || module.description !== newModule.description) {
                                                        module.date = Date.now();
                                                    }
                                                    module.updateOne({
                                                        title: newModule.title,
                                                        description: newModule.description,
                                                        position: newModule.position
                                                    })
                                                        .catch((err) => res.status(500).json({error: err.message}))
                                                } else {
                                                    Module.deleteOne({_id: module._id})
                                                }
                                            })
                                    })
                                })

                            path.save()
                                .then(() => res.status(200).json())
                                .catch((err) => res.status(500).json({error: err.message}))
                        }
                    }
                })
                .catch((error) => res.status(500).json({error: error.message}));
        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.edit2 = (req, res) => {
    asyncLib.waterfall([
        (done) => {
            User.findOne({_id: req.body.idUser})
                .then(user => done(null, user))
                .catch(error => res.status(500).json({error: error.message}))
        },

        (user, done) => {
            if (!user) {
                res.status(401).json({error: 'you are not connected'});
            } else {
                Path.findOne({_id: req.body.path.idPath})
                    .then(path => done(null, user, path))
                    .catch(error => res.status(500).json({error: error.message}))
            }
        },

        (user, path, done) => {
            if (!path) {
                res.status(404).json({error: 'path not found'});
            } else {
                // vérification qu'on est bien le propriétaire
                if (!path.idCreator.equals(user._id)) {
                    res.status(403).json({error: 'you are not the owner'})
                } else {
                    // mise à jour du parcours
                    path.updateOne({
                        title: req.body.path.title,
                        description: req.body.path.description,
                        date: new Date()
                    }).then(() => done(null, user, path))
                        .catch(error => res.status(500).json({error: error.message}))
                }
            }
        },
        // traitement modules
        async (user, path, done) => {
            // si on envoie des modules
            if (req.body.path.modules) {
                // mise à jour des modules
                for (module of req.body.path.modules) {
                    await updateModule(module)
                }

                async function updateModule(module) {
                    return new Promise(resolve => {
                        Module.findOne({_id: module.idModule})
                            .then(m => {
                                m.updateOne({
                                    title: module.title,
                                    description: module.description,
                                    position: module.position,
                                    date: new Date()
                                }).then(() => resolve())
                                    .catch(error => res.status(500).json({error: error.message}))
                            })
                    })
                }

                // vérification suppression module
                async function deleteModule() {
                    return new Promise(resolve => {
                        Module.find({idPath: path._id})
                            .then(modules => {
                                    // si des modules ont été supprimés
                                    if (modules.length > req.body.path.modules.length) {
                                        let idModulesSent = [];
                                        let idModuleRegister = []

                                        req.body.path.modules.forEach(m => {
                                            idModulesSent.push(m.idModule);
                                        });

                                        modules.forEach(m => {
                                            idModuleRegister.push(m._id)
                                        });

                                        // vérification suppression module
                                        idModuleRegister.forEach(idModule => {
                                            if (!idModulesSent.includes(idModule)) {
                                                Module.deleteOne({_id: idModule}).catch(error => res.status(500).json({error: error.message}))
                                            }
                                        })
                                    }
                                    resolve()
                                }
                            )
                    })
                }

            }
        },
        // traitement tags
        (done) => {
            TagAssociation.find({idPath: req.params.idPath})
                .then(async allTags => {
                    let tagRegister = []
                    let tagSent = [];

                    for (let t of allTags) {
                        tagRegister.push(await getTagName(t))
                    }


                    async function getTagName(tag) {
                        return new Promise(resolve => {
                            Tag.findOne({_id: tag.idTag})
                                .then(t => {
                                    TagAssociation.findOne({
                                        idPath: req.params.idPath,
                                        idTag: t._id
                                    }).then(exist => {
                                        resolve(exist ? t.name : null)
                                    })
                                })
                                .catch(error => res.status(500).json({error: error.message}))
                        })
                    }

                    req.body.path.tags.forEach(t => tagSent.push(t.name));

                    if (tagSent.join() === tagRegister.join())
                        res.status(200).json();
                    else {
                        // vérification suppression
                        for (const tag of tagRegister) {
                            if (!tagSent.includes(tag)) {
                                await deleteTag(tag);
                            }
                        }

                        // vérification ajout
                        for (const tag of tagSent) {
                            if (!tagRegister.includes(tag)) {
                                await addTag(tag)
                            }
                        }
                    }

                    async function deleteTag(tag) {
                        return new Promise(resolve => {
                            Tag.findOne({name: tag})
                                .then(t => {
                                    TagAssociation.deleteOne({
                                        idPath: path._id,
                                        idTag: t._id
                                    }).then(() => resolve())
                                        .catch(error => res.status(500).json({error: error.message}))
                                }).catch(error => res.status(500).json({error: error.message}))
                        })
                    }

                    async function addTag(tag) {
                        return new Promise(resolve => {
                            Tag.findOne({name: tag})
                                .then(t => {
                                    if (!t) {
                                        t = new Tag({name: ("" + tag)})
                                            .save()
                                            .then(() => {
                                                new TagAssociation({
                                                    idPath: path._id,
                                                    idTag: t._id
                                                }).save().then(tmp => {
                                                    resolve();
                                                }).catch(error => res.status(500).json({error: error.message}))
                                            })
                                    } else {
                                        new TagAssociation({
                                            idPath: req.params.idPath,
                                            idTag: t._id
                                        }).save().then(tmp => {
                                            resolve()
                                        }).catch(error => res.status(500).json({error: error.message}))
                                    }
                                })
                        })
                    }

                    res.status(200).json();
                })

        }
    ]).then(() => res.status(200).json())
        .catch(error => res.status(500).json({error: error.message}))
}

exports.getOne = (req, res) => {
    Path.findOne({_id: req.params.idPath})
        .then((path) => {
            if (!path) {
                res.status(404).json({error: 'Path not found'});
            } else {
                let jsonmodules = [];
                let tags = [];
                User.findOne({_id: path.idCreator})
                    .then((user_path) => {
                        Module.find({idPath: req.params.idPath})
                            .then(async (modules) => {
                                if (modules.length !== 0) {
                                    for (const module of modules) {
                                        jsonmodules.push(await get(module));
                                    }
                                }

                                async function get(module) {
                                    return new Promise(resolve => {
                                        User.findOne({_id: module.idCreator})
                                            .then((user) => {
                                                resolve({
                                                    idModule: module._id,
                                                    title: module.title,
                                                    description: module.description,
                                                    idCreator: user._id,
                                                    pseudo: user.pseudo,
                                                    date: module.date,
                                                    position: module.position
                                                })
                                            })
                                    })
                                }

                                TagAssociation.find({idPath: path._id})
                                    .then(async allTag => {
                                        for (let tag of allTag)
                                            tags.push(await getTagName(tag));

                                        res.status(200).json({
                                            idPath: path._id,
                                            title: path.title,
                                            description: path.description,
                                            idCreator: user_path._id,
                                            pseudo: user_path.pseudo,
                                            date: path.date,
                                            modules: modules,
                                            tags: tags
                                        });
                                    })

                                async function getTagName(tagAssociation) {
                                    return new Promise(resolve => {
                                        Tag.findOne({_id: tagAssociation.idTag})
                                            .then((tag) => resolve(tag))
                                            .catch(error => res.status(500).json({error: error.message}))
                                    });
                                }


                            })
                            .catch((error) => res.status(500).json({error: error.message}));
                    })
            }
        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.delete = (req, res) => {
    User.findOne({_id: req.query.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then(path => {
                    if (!path) {
                        res.status(404).json({error: 'Path not found'});
                    } else {
                        if (!user._id.equals(path.idCreator)) {
                            res.status(403).json({error: "You're not the owner"});
                        } else {
                            Path.deleteOne({_id: path._id})
                                .then(() => res.status(200).json())
                                .catch((err) => res.status(500).json({error: err.message}))
                        }
                    }
                })
                .catch(error => res.status(500).json({error: error.message}));
        })
        .catch(error => res.status(500).json({error: error.message}));
}

exports.addModule = (req, res) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then((path) => {
                    if (!path) {
                        res.status(404).json({error: 'Path not found'});
                    } else {
                        Module.find({idPath: req.params.idPath}).countDocuments()
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
                                        position: position + 1
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
                    }
                })
                .catch((err) => res.status(500).json({error: err.message}))
        })
        .catch((err) => res.status(500).json({error: err.message}))
}

exports.editModule = (req, res) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then(path => {
                    if (!path) {
                        res.status(404).json({error: 'Path not found'});
                    } else {
                        Module.findOne({_id: req.params.idModule})
                            .then((module) => {
                                if (!module) {
                                    res.status(404).json({error: 'Module not found'});
                                } else {
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
                                }
                            })
                            .catch((error) => res.status(500).json({error: error.message}));
                    }
                })
                .catch((error) => res.status(500).json({error: error.message}));
        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.deleteModule = (req, res) => {
    User.findOne({_id: req.query.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then(path => {
                    if (!path) {
                        res.status(404).json({error: 'Path not found'});
                    } else {
                        Module.findOne({_id: req.params.idModule})
                            .then(module => {
                                if (!module) {
                                    res.status(404).json({error: 'Module not found'});
                                } else {
                                    if (!user._id.equals(module.idCreator)) {
                                        res.status(403).json({error: "You're not the owner"});
                                    } else {
                                        Module.deleteOne({_id: module._id})
                                            .then(async () => {
                                                async function decalePosition() {
                                                    Module.find({idPath: path._id})
                                                        .then((modules) => {
                                                            modules.forEach(module2 => {
                                                                if (module2.position > module.position) {
                                                                    module2.position--
                                                                    module2.save().catch((err) => res.status(500).json({error: err.message}))
                                                                }
                                                            })
                                                        })
                                                }

                                                await decalePosition();
                                                path.date = Date.now();
                                                path.save()
                                                    .then(() => res.status(200).json())
                                                    .catch((err) => res.status(500).json({error: err.message}))
                                            })
                                            .catch((err) => res.status(500).json({error: err.message}))
                                    }
                                }
                            })
                            .catch((error) => res.status(500).json({error: error.message}));
                    }
                })
                .catch((error) => res.status(500).json({error: error.message}));
        })
        .catch((error) => res.status(500).json({error: error.message}));
}

exports.getOneModule = (req, res) => {
    Path.findOne({_id: req.params.idPath})
        .then(path => {
            if (!path) {
                res.status(404).json({error: 'Path not found'});
            } else {
                Module.findOne({_id: req.params.idModule})
                    .then((module) => {
                        if (!module) {
                            res.status(404).json({error: 'Module not found'});
                        } else {
                            User.findOne({_id: module.idCreator})
                                .then(user => {
                                    Resource.find({idModule: req.params.idModule})
                                        .then(async resources => {
                                            if (resources.length === 0) {
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
                                            } else {
                                                let tab = [];

                                                async function get() {
                                                    resources.forEach(resource => {
                                                        tab.push({
                                                            idResource: resource._id,
                                                            idModule: resource.idModule,
                                                            url: resource.url,
                                                            title: resource.title,
                                                            description: resource.description,
                                                            idCreator: resource.idCreator,
                                                            date: resource.date,
                                                            position: resource.position
                                                        })
                                                    })
                                                }

                                                await get();
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
                                        .catch((error) => res.status(500).json({error: error.message}));
                                })
                        }
                    })
                    .catch((error) => res.status(500).json({error: error.message}));
            }
        })
}

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

exports.findByKeyWord = (req, res) => {
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
        res.status(200).json(json);
    })
        .catch(error => res.status(500).json({error: error.message}))
}

exports.cloneModule = (req, res) => {
    User.findOne({_id: req.body.idUser})
        .then((user) => {
            Path.findOne({_id: req.params.idPath})
                .then(path => {
                    if (!path) {
                        res.status(404).json({error: 'Path not found'});
                    } else {
                        Module.findOne({_id: req.params.idModule})
                            .then((module) => {
                                if (!module) {
                                    res.status(404).json({error: 'Module not found'});
                                } else {
                                    Path.findOne({_id: req.body.idPath2})
                                        .then(path2 => {
                                            if (!path2) {
                                                res.status(404).json({error: 'Path2 not found'});
                                            } else {
                                                if (!user._id.equals(path2.idCreator)) {
                                                    res.status(403).json({error: "You're not the owner"});
                                                } else {
                                                    //vérification que le module n'existe pas déjà dans le parcours
                                                    Module.findOne({idPath: path2._id, title: module.title})
                                                        .then((exist) => {
                                                            if (exist) {
                                                                res.status(409).json({error: 'Module already exists'});
                                                            } else {
                                                                Module.find({idPath: req.body.idPath2}).countDocuments()
                                                                    .then((position) => {
                                                                        new Module({
                                                                            idPath: req.body.idPath2,
                                                                            idCreator: user._id,
                                                                            title: module.title,
                                                                            description: module.description,
                                                                            date: new Date(),
                                                                            position: position + 1,
                                                                        }).save()
                                                                            .then(newModule => {
                                                                                Resource.find({idModule: newModule._id}).countDocuments()
                                                                                    .then(async position => {
                                                                                        Resource.find({idModule: module._id})
                                                                                            .then((resources) => {
                                                                                                resources.forEach(async resource => {
                                                                                                    await cloneResources(resource);
                                                                                                })
                                                                                            })

                                                                                        async function cloneResources(resource) {
                                                                                            return new Promise(resolve => {
                                                                                                new Resource({
                                                                                                    idModule: newModule._id,
                                                                                                    idCreator: user._id,
                                                                                                    url: resource.url,
                                                                                                    title: resource.title,
                                                                                                    description: resource.description,
                                                                                                    date: new Date(),
                                                                                                    position: position + 1
                                                                                                }).save()
                                                                                                    .then((resource) => {
                                                                                                        resolve()
                                                                                                    })
                                                                                                    .catch((err) => {
                                                                                                        res.status(500).json({error: err.message})
                                                                                                    })
                                                                                            })
                                                                                        }

                                                                                        Path.findOne({_id: newModule.idPath})
                                                                                            .then(path => {
                                                                                                path.updateOne({date: new Date()})
                                                                                                    .then(() => res.status(200).json({}))
                                                                                                    .catch((err) => res.status(500).json({error: err.message}))
                                                                                            })
                                                                                            .catch((err) => res.status(500).json({error: err.message}))
                                                                                    })
                                                                                    .catch((err) => res.status(500).json({error: err.message}))

                                                                            })
                                                                            .catch((err) => res.status(500).json({error: err.message}))
                                                                        //récupération de l'id du module

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

exports.addTag = (req, res) => {
    asyncLib.waterfall([
        (done) => {
            User.findOne({_id: req.body.idUser})
                .then(user => done(null, user))
                .catch(error => res.status(500).json({error: error.message}))
        },

        (user, done) => {
            if (!user)
                res.status(401).json({error: 'wrong idUser'})
            else {
                Path.findOne({_id: req.params.idPath})
                    .then(path => done(null, user, path))
                    .catch(error => res.status(500).json({error: error.message}))
            }
        },

        (user, path, done) => {
            if (!path) {
                res.status(404).json({error: 'path not found'})
            } else {
                Tag.findOne({name: req.body.tagName})
                    .then(tag => {
                        if (tag) {
                            done(null, user, path, tag)
                        } else {
                            new Tag({
                                name: req.body.tagName
                            }).save()
                                .then(tag => done(null, user, path, tag))
                                .catch(error => res.status(500).json({error: error.message}))
                        }
                    })
            }
        },

        (user, path, tag, done) => {
            TagAssociation.findOne({idPath: path._id, idTag: tag._id})
                .then(exist => {
                    if (exist)
                        res.status(409).json({error: 'tag already add'})
                    else {
                        new TagAssociation({
                            idPath: path._id,
                            idTag: tag._id
                        }).save()
                            .then(done(tag))
                            .catch(error => res.status(500).json({error: error.message}))
                    }
                })
        }
    ])
        .then(tag => {
                if (tag)
                    res.status(201).json({})
                else
                    res.status(500).json({error: 'cannot add tag'})
            }
        ).catch(error => res.status(500).json({error: error.message}));
}

exports.getAllPathTag = (req, res) => {
    asyncLib.waterfall([
        (done) => {
            Path.findOne({_id: req.params.idPath})
                .then(path => done(null, path))
                .catch(error => res.status(500).json({error: error.message}))
        },

        (path, done) => {
            TagAssociation.find({idPath: path._id})
                .then(tags => done(null, path, tags))
                .catch(error => res.status(500).json({error: error.message}))
        },

        (path, tagAssociations, done) => {
            let json = [];
            tagAssociations.forEach(async tag => {
                json.push(await getTag(tag));
            })

            function getTag(tagAssociation) {
                return new Promise(resolve => {
                    Tag.findOne({_id: tagAssociation.idTag})
                        .then(tag => resolve(tag))
                        .catch(error => res.status(500).json({error: error.message}))
                });
            }

            done(json);
        }
    ])
        .then(json => res.status(200).json(json))
        .catch(error => res.status(500).json({error: error.message}))
}

exports.editPathTag = (req, res) => {

}

exports.deletePathTag = (req, res) => {

}
