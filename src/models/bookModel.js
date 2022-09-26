const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        unique: true,
        uppercase : true
    },
    excerpt: {
        type: String,
        require: true,
        trim: true
    },
    userId: {
        type: ObjectId,
        require: true,
        ref: 'User',
        trim: true
    },
    ISBN: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        require: true,
        trim: true
    },
    subcategory: {
        type: String,
        require: true,
        trim: true
    },
    reviews: {
        type: Number,
        default: 0,
        trim: true

    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        require: true
    }
}, { timestamps: true })


module.exports = mongoose.model("Book", bookSchema);
