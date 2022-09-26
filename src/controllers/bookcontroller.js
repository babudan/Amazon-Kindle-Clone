const mongoose = require('mongoose')
// const validUser = require("../validation/validUser")
const BookModel = require('../models/bookModel')
const userModel = require("../models/userModel")
const ReviewModel = require("../models/reviewModel")
// const ObjectId = mongoose.Schema.Types.ObjectId

//==========================================😳 creating Books 😳=========================================================================

const createBook = async function (req, res) {
    try {
        let data = req.body
        let userId = data.userId
        let isValid = mongoose.Types.ObjectId.isValid(userId)

        if (isValid == false) return res.status(400).send({ status: false, message: "Invalid length of UserId" })

        let result = await userModel.findById(userId)
        if (!result) return res.status(400).send({ status: false, message: "Please enter the registerd UserId" })

        //-------------checking authorization----------------------------------------------------------- 
        if (req.decodedToken.userId != userId)
            return res.status(403).send({ status: false, message: "you are not authorised" })

        let finalData = await BookModel.create(data)
        return res.status(201).send({ status: true, message: "created book", data: finalData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//================================😊 get-book-details😊 ==================================================================================

const getbook = async function (req, res) {
    try {

        let que = req.query
        let userid = que.userId;

        // if user id present then only it will eneter into if block and check the id is not valid otherwise it will not enetr into if block
        // ------------------------handle userid---------------------------------------------------
        if (userid || userid == '') {
            if (!mongoose.Types.ObjectId.isValid(userid)) {
                return res.status(400).send({ status: false, message: "UserId is not valid" })
            }
        }
        // ------------------------------get books-------------------------------------------------------- 
        const newgetBooks = await BookModel.find({ $and: [{ isDeleted: false }, que] }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })
        
        if(newgetBooks.isDeleted == true)   return res.status(400).send({ status: false, message: "Book is already deleted" })

        //         // ---------------nothing found----------------------------------------------------------
        if (newgetBooks.length == 0 || newgetBooks == null ) return res.status(404).send({ status: false, message: "no books found" })  //-------null is use because if i give wrong id with 28 character then it can not read properties of authorid so it gets back null 

        return res.status(200).send({ status: true, message: "Books list", data: newgetBooks});

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//=====================================😮 get by query-params 😮=======================================================================================

const getBookByParams = async function (req, res) {

    try {

        let bookId = req.params.bookId

        if (!mongoose.Types.ObjectId.isValid(bookId)) { return res.status(400).send({ status: false, message: "bookId is not valid" }) }

        const book = await BookModel.findById(bookId)

        if (!book) return res.status(404).send({ status: false, message: "No book found from this bookId" })
        if(book.isDeleted == true) return res.status(404).send({ status: false, message: "books are already deleted" })

        const reviewsData = await ReviewModel.find({ bookId: book._id }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (!reviewsData) return res.status(404).send({ status: false, message: "No book found from this bookId" })
        book.reviewsData = reviewsData

        let Book = {
            _id: book._id, title: book.title, excerpt: book.excerpt, userId: book.userId, category: book.category, subcategory: book.subcategory,
            isDeleted: book.isDeleted, reviews: book.reviews, releasedAt: book.releasedAt, createdAt: book.createdAt, updatedAt: book.updatedAt, reviewsData: book.reviewsData
        }
        return res.status(200).send({ status: true, message: 'Books list', data: Book });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

//==========================================updated book==================================================================================

const updateBook = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) { return res.status(400).send({ status: false, message: "bookId is not valid" }) }
        let bookData = req.body;
        let { title, excerpt, releasedAt, ISBN } = bookData;

        //-----------------check body is empty or not-----------------------------------------------------------
        if (Object.keys(bookData).length == 0)
            return res.status(400).send({ status: false, message: "plss put some data in body" });

        let newtitle = await BookModel.findOne({ title });
        if (newtitle) return res.status(400).send({ status: false, message: "title is already present" });

        let newISBN = await BookModel.findOne({ ISBN });
        if (newISBN) return res.status(400).send({ status: false, message: "ISBN is already present" });

        //--------------CHECKING BOOK IS ALREADY DELETED OR NOT-------------------------------------
        const book = await BookModel.findById(bookId);
        if (book.isDeleted == true)
            return res.status(400).send({ status: false, message: "Book is already deleted" });

        let updateBook = await BookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            {
                $set: {
                    title: title, excerpt: excerpt,
                    releasedAt: releasedAt, ISBN: ISBN
                }
            },
            { new: true }
        );
        if (!updateBook) {
            return res.status(404).send({ status: false, message: "bookId not found" })
        }
        else {
            return res.status(200).send({ status: true, message: "book has been updated", data: updateBook })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//=================================================== delete book ==================================================================================================

const deleteBook = async function (req, res) {
    try {
        let bookId = req.params.bookId

        if (!bookId)
            return res.status(400).send({ status: false, message: "Please enter valid bookId" })

        const book = await BookModel.findById(bookId)
        if (book.isDeleted == true)
            return res.status(400).send({ status: false, message: "Book is already Deleted" })

        let deletedData = await BookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        if (!deletedData)
            return res.status(404).send({ status: false, message: "Book is not present in the collection" })

        return res.status(200).send({ status: true, message: "Book has been Deleted", data: deletedData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createBook, deleteBook, getbook, getBookByParams, updateBook }
