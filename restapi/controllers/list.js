const mongoose = require('mongoose');
const models = require('../models')
const { auth, isAdmin } = require('../utils')
const router = require('express').Router()

router.get('/:id', auth, getLists)

router.post('/:id', auth, isAdmin, createList)

router.put('/:id/:idlist', auth, updateList)

router.delete('/:id/:idlist', auth, isAdmin, deleteList)



async function getLists(req, res, next) {
    const projectId = req.params.id;
    const lists = await models.Project.findOne({ _id: projectId }).select('lists -_id');
    console.log(lists);

    const populatedLists = await models.List.find({ _id: { $in: lists.lists } }).populate('cards');

    res.send(populatedLists);
}

async function createList(req, res, next) {
    const userId = req.user._id;
    const projectId = req.params.id;
    const listName = req.body.name;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const listCreationResult = await models.List.create([{ name: listName, author: userId }], { session })
        const createdList = listCreationResult[0];
        await models.Project.updateOne({ _id: projectId }, { $push: { lists: createdList } }, { session })

        await session.commitTransaction();

        session.endSession();

        res.send(createdList);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.send(error);
    }
}

async function updateList(req, res, next) {
    const id = req.params.idlist;
    const { name } = req.body;
    console.log(id, name);
    const updatedList = await models.List.updateOne({ _id: id }, { name })
    res.send(updatedList)

}

async function deleteList(req, res, next) {
    const idList = req.params.idlist
    const idProject = req.params.id
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const searchedCards = await models.List.findOne({ _id: idList }).select('cards -_id').session(session)

        await models.Card.deleteMany({ _id: { $in: searchedCards.cards } }).session(session)

        const removedListResult = await models.List.deleteOne({ _id: idList }).session(session)

        removedList = removedListResult

        await models.Project.updateOne({ _id: idProject }, { $pull: { lists: idList } }).session(session)

        await session.commitTransaction();

        session.endSession();

        res.send(removedList)
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.send(error);
    }

}


module.exports = router