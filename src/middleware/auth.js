const jwt = require("jsonwebtoken")
const { default: mongoose } = require("mongoose")
const BookModel = require("../models/bookModel")

//==========================================authentication=================================================================

const Authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) return res.status(400).send({ status: false, message: "Token required" })

        jwt.verify(token, process.env.SECRET_TOKEN , (error, decodedToken) => {
            if (error) {
                return res.status(401).send({ status: false, message: "token is invalid" });

            }
            req["decodedToken"] = decodedToken    //this line for we can access this token outside the middleware

            next()
        });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}
//========================================================Authorisation==============================================================

const Authorisation = async function (req, res, next) {
    try {
        let bookId = req.params.bookId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter correct bookId" })
        }
        let userLoggedIn = req.decodedToken.userId
        let bookData = await BookModel.findById(bookId)
        if (bookData === null) return res.status(404).send({ status: false, message: "bookId does not exist" })
        if (bookData.userId != userLoggedIn) {
            return res.status(403).send({ status: false, message: "You are not authorised" })
        }
        next()
    } catch (err) {
        return res.status(500).send({ status: false, message: "Token Problem" })
    }
}

module.exports = { Authentication, Authorisation }