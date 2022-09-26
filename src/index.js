const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const  mongoose  = require('mongoose');
require('dotenv').config();
const app = express();

app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({ extended: true }))


mongoose.connect(process.env.DB, {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

//----------handling wrong api edge case--------------------------------------------
app.use((req, res, next) => {
    res.status(400).send({ status: false, error: "URL is wrong" });
})


app.listen(process.env.PORT , () => {
    console.log(`Express app running on port ${process.env.PORT}`)
});
