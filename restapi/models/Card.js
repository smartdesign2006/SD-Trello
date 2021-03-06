const mongoose = require('mongoose')

const { Schema } = mongoose
const Model = mongoose.model
const { String, ObjectId } = Schema.Types

const cardSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
    },

    author: {
        type: ObjectId,
        ref: 'User',
        required: true
    },

    members: [{
        type: ObjectId,
        ref: 'User'
    }],

    dueDate: Date,

    progress: {
        type: Number
    },

    history: [{}],

    attachments: [{
        path: { type: String },
        name: { type: String },
        format: { type: String },
        publicId: { type: String },
    }]

})


module.exports = new Model('Card', cardSchema)