const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const keyToken = 'CS969dVVN70s2vWD5pxJUCsRE499308uTacBU179OQ06rgn5oIfZissIK13O7uA7k70Lpr48m3TxgvixGKBCD9OFKEvsQN5kp7J3HTxV7kSk8wuK0446yJGE5MJ4hj90xrQWCi0X2i3XB505wc047A93ekNjhng47meRWyymyuQ1501B2EiR6eovJx5oVEq248p9HI9u';

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                pseudo: req.body.pseudo,
                password: hash,
                status: 1
            });
            user.save()
                .then(user => {
                    res.status(201).json({
                        idUser: user._id,
                        token: jwt.sign(
                            {idUser: user._id, pseudo: user.pseudo},
                            keyToken,
                            {expiresIn: '1h'}
                        )
                    });
                })
                .catch(error => res.status(403).json({
                    error: "Pseudo already use"
                }));
        })
        .catch(error => {
            res.status(500).json({error: error.message})
        });
}

exports.login = (req, res, next) => {
    User.findOne({pseudo: req.body.pseudo})
        .then(user => {
            if (!user) {
                res.status(404).json({error: "wrong pseudo"});
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({error: "wrong password"});
                        } else {
                            res.status(200).json({
                                idUser: user._id,
                                status: user.status,
                                token: jwt.sign({
                                        idUser: user._id,
                                        pseudo: user.pseudo
                                    },
                                    keyToken,
                                    {expiresIn: '1h'})
                            });
                        }
                    })
            }
        })
}


