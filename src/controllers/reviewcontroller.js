const mongoose = require("mongoose");
const bookModel = require("../models/bookModel");
const BookModel = require('../models/bookModel')
const ReviewModel = require("../models/reviewModel")


//===============================================create review==========================================================================================
const reviews = async (req, res) => {
    try {
        let data = req.body;
        let bookId = req.params.bookId
        if (!mongoose.Types.ObjectId.isValid(bookId)) { return res.status(400).send({ status: false, message: "bookId is not valid" }) }

        const book = await bookModel.findById(bookId)
        if (!book) return res.status(404).send({ status: false, message: "No book found from this bookId" })

        if (book.isDeleted == true)
            res.status(400).send({ status: true, message: "the book is already deleted" });

        if (!data.bookId) data.bookId = bookId.toString();
        
        if (!data.reviewedBy) data.reviewedBy = "Guest";
        if (!data.reviewedAt) data.reviewedAt = new Date;


        const updatebook = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: +1 } }, { new: true }).lean();
        const newreview = await ReviewModel.create(data);

        updatebook["reviewsdata"] = newreview;
        return res.status(201).send({ status: true, message: "Success", data: updatebook })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//====================================================update review===================================================================================================

const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "bookId is not valid" })

        let reviewId = req.params.reviewId
        if (!mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: "reviewId is not valid" })

        let reviewData = req.body
        let { reviewedBy, rating, review } = reviewData

        //--------------------------------------check for request body---------------------------------------------------------
        if (Object.keys(reviewData).length == 0) return res.status(400).send({ status: false, message: "please add some data for updates!!!" })

        //-------------------------------checking the keys with regex------------------------------------------------------------------
        if (!/^[a-z ,.'-]+$/.test(reviewedBy))  // this rejex is taking spaces between words.   
            return res.status(400).send({ status: false, message: "enter valid reviewer name" });
           
        if(rating){
        if (!/^\s*([1-5]){1}\s*$/.test(rating)) return res.status(400).send({ status: false, message: "ratings is accept only 1 to 5 digit only" })
        }
        if (!/^[a-zA-Z ,]{3,}$/.test(review)) return res.status(400).send({ status: false, message: "enter valid review" });


        //---------------------check if book exist in collection or not------------------------------------------------------------------------
        const book = await BookModel.findById(bookId)

        if (!book) return res.status(404).send({ status: false, message: "No Book with this bookId was found in the reviewModel" })

        //-------------------------checking the book is deleted already or present-------------------------------------------------------------------------
        if (book.isDeleted == true) return res.status(400).send({ status: false, message: "Book is deleted so you not able to update it" })

        const rev = await ReviewModel.findById(reviewId)
        if (!rev) return res.status(404).send({ status: false, message: "No reviews with this reviewID was found in the reviewModel" })

        if (rev.isDeleted == true) return res.status(400).send({ status: false, message: "reviews are deleted so you not able to update it" })

        let updateReview = await ReviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false },
            {
                $set: {
                    review: review, rating: rating, reviewedBy: reviewedBy, reviewedAt: new Date
                }
            }, { new: true })

        // ---------------------------adding a newkey----------------------------------------------------------
        book._doc.reviewData = updateReview;

        if (!updateReview) return res.status(400).send({ status: false, message: "Something went wrong!!!!" })

        return res.status(200).send({ status: true, message: "Updated the reviews!!!!", data: { book: book } });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//====================================delete review==============================================================

const deleteReview = async function (req, res) {
    try {
        let { bookId, reviewId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "please end valid bookid" })
        }
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, message: "please end valid reviewid" })
        }
        let checkReview = await ReviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!checkReview) {
            return res.status(404).send({ status: false, message: "review not found" })
        }

        let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!checkBook) {
            return res.status(404).send({ status: false, message: "book not found" })
        }

        let checknewReview = await ReviewModel.find({ _id: reviewId, bookId, isDeleted: false });
        await ReviewModel.findByIdAndUpdate(
            { _id: reviewId },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );
        await BookModel.findByIdAndUpdate(
            { _id: bookId },
            { reviews: checkBook.reviews - 1 }
        );
        if (!checknewReview) {
            return res.status(404).send({ status: false, message: "No review found for this book " })
        }
        return res.status(200).send({ status: true, message: "reveiws has been deleted" })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }

}

module.exports = { reviews, updateReview, deleteReview }
