const mongoose = require('mongoose')
const models = require('../models')
const config = require('../config/config')
const utils = require('../utils')
const router = require('express').Router()
const bcrypt = require('bcrypt')

router.get('/verify', verifyLogin);

router.get('/:id', getUser)

router.post('/register', registerUser)

router.post('/login', loginUser)

router.post('/logout', logoutUser)

router.put('/:id', updateUser)

router.delete('/:id', deleteUser)

async function getUser(req, res, next) {
    const user = await models.User.findById(req.params.id)
    res.send(user);
}

async function registerUser(req, res, next) {
    const { email, username, password } = req.body;
    const createdUser = await models.User.create({ email, username, password })
    const token = utils.jwt.createToken({ id: createdUser._id })
    res.header("Authorization", token).send(createdUser)

}

function verifyLogin(req, res, next) {

    const token = req.headers.authorization || '';

    Promise.all([
        utils.jwt.verifyToken(token),
        models.TokenBlacklist.findOne({ token })
    ])
        .then(([data, blacklistToken]) => {
            if (blacklistToken) { return Promise.reject(new Error('blacklisted token')) }
            models.User.findById(data.id)
                .then((user) => {
                    return res.send({
                        status: true,
                        user
                    })
                });
        })
        .catch(err => {
            if (['token expired', 'blacklisted token', 'jwt must be provided'].includes(err.message)) {
                res.status(401).send('UNAUTHORIZED!');
                return;
            }

            res.send({
                status: false
            })
        })
}

async function loginUser(req, res, next) {
    const { email, username, password } = req.body
    const user = await models.User.findOne({ email })
    const match = await user.matchPassword(password)

    if (!match) {
        res.status(401).send('Invalid password')
        return;
    }

    const token = utils.jwt.createToken({ id: user._id })
    res.header("Authorization", token).send(user)
}


async function logoutUser(req, res, next) {
    const token = req.cookies[config.authCookieName]
    await models.TokenBlacklist.create({ token })
    res.clearCookie(config.authCookieName).send('Logout successfully!')
}


async function updateUser(req, res, next) {
    const id = req.params.id
    let { username, password } = req.body

    await bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) { next(err); return }
            const updatedUser = await models.User.updateOne({ _id: id }, { username, password: hash })
            res.send(updatedUser)
        })
    })
}


async function deleteUser(req, res, next) {
    const id = req.params.id;

    const session = await mongoose.startSession()
    session.startTransaction();

    try {
        const removedUser = await models.User.deleteOne({ _id: id }).session(session);
        const userProjectsRoles = await models.ProjectUserRole.find({ memberId: id }).session(session);
        await models.Project.updateMany({ _id: { $in: userProjectsRoles.projectId } }, { $pull: { membersRoles: userProjectsRoles._id } }).session(session);
        await models.Project.deleteMany({ author: id }).session(session);
        await models.ProjectUserRole.deleteMany({ memberId: id }).session(session);

        await session.commitTransaction();

        session.endSession();

        res.send(removedUser);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.send(error);
    }

}


module.exports = router;
