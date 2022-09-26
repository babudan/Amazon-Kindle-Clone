const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')


//======================😮 user creation 😮==============================================================================================

const createUser = async (req, res) => {
  try {
    let data = req.body

    let savedData = await userModel.create(data)
    return res.status(201).send({ status: true, msg: "created succesfully", data: savedData })
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

//========================😎 user login 😎==============================================================================================

const login = async (req, res) => {
  try {

    let { email, password } = req.body
    if (!email) return res.status(400).send({ status: false, msge: "please enter the email to login" })
    if (!password) return res.status(400).send({ status: false, msge: "please enter the password to login" })
    let Email = await userModel.findOne({ email: email })
    if (!Email)
      return res.status(404).send({ status: false, msg: "Email is wrong" })
    
    // if eamil and password is correct
    let userLogin = await userModel.findOne({ email: email, password: password })

    //-------------------------------😎token generation😎--------------------------------------------------
    const token = jwt.sign(
      {
        userId: userLogin._id,
        group: "45",
        iat: Math.floor(Date.now() / 1000) - 30
      },
      process.env.SECRET_TOKEN,
      { expiresIn: "24h" });

    res.setHeader("x-api-key", token)

    return res.status(200).send({ status: true, msg: "login succesfully", data: { token: token } });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
}


module.exports = { createUser, login };
