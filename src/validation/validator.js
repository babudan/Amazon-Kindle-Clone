const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");
const myValidUser = async (req, res, next) => {
  try {
    let data = req.body;
    let title = ["Mr", "Mrs", "Miss"];

    //======================> to check the data in body <==============================================================================================================

    if (Object.keys(data).length == 0)
      return res.status(400).send({ status: false, message: "please enter credential data" });

    //--------------------> Title validation <--------------------------------------------------------------------------------------------

    if (!data.title)
      return res.status(400).send({ status: false, message: "Please enter title and valid details " });

    if (!title.includes(data.title.trim()))
      return res.status(400).send({ status: false, message: "Please enter  valid Mr,Mrs,Miss " });


    //=====================> Name validation and REGEX <===================================================================================================

    let Name = data.name;

    if (!Name) return res.status(400).send({ status: false, message: "Please enter Name" });

    //-----------------------> REGEX <------------------------------------------------------------------------------------------------------------------------------
    if (!/^[A-Za-z]{1,35}/.test(Name))
      return res.status(400).send({ status: false, message: "Please enter valid name and  only numbers are not allowed" });

    if (typeof Name === "string" && Name.trim().length == 0)
      return res.status(400).send({ status: false, message: "input valid NAme" });


    //------------------------> Phone validation and REGEX <------------------------------------------------------------------------------------------------

    if (!data.phone)
      return res.status(400).send({ status: false, message: "please input phone section" });

    let number = req.body.phone;
    if (await userModel.findOne({ phone: number }))
      return res.status(400).send({ status: false, message: "phone number is already taken" });

    //-------------------------> REGEX <---------------------------------------------------------------------------------------------------------

    if (!/^[6-9]\d{9}$/.test(data.phone))
      return res.status(400).send({ status: false, message: "Wrong Mobile Number" });

    //=====================> E-mail validation and REGEX <===============================================================================

    if (!data.email)
      return res.status(400).send({ status: false, message: "please input email section" });

    //-------------------------> REGEX <--------------------------------------------------------------------------------------------------------

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email))
      return res.status(400).send({ status: false, message: "Invalid Email Id" });

    let emailId = req.body.email;

    let validEmail = await userModel.findOne({ email: emailId });
    if (validEmail)
      return res.status(400).send({ status: false, message: "E-mail already taken" });

    //======================> Password Validation and REGEX <==============================================================================================

    if (!data.password)
      return res.status(400).send({ status: false, message: "please input password section" });

    //-------------------> REGEX <-----------------------------------------------------------------------------------------------------

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,15}$/.test(data.password))
      return res.status(400).send({ status: false, message: "Atleat 1 uppercase, 1 lowercase, 1 numberic value , 1 special character and Length should be between 8 t0 14 for password!!!" });

    //---------------adress validation--------------------------------------------------------------------------------
    let newadress = data.address;
    // empty object value is truthy so is no key present in adress in taht case also its go into if 
    if (newadress) {
      if (!newadress.street) {
        return res.status(400).send({ status: false, message: "Street address cannot be empty" })
      }
      if (!newadress.city) {
        return res.status(400).send({ status: false, message: "City cannot be empty" })
      }
      if (!newadress.pincode) {
        return res.status(400).send({ status: false, message: "Pincode cannot be empty" })
      }
      
    }

    next();
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

//======================## book-Validation ##===================================================================================

const bookValidation = async (req, res, next) => {
  try {
    let data = req.body;
    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;
    if (Object.keys(data).length == 0)
      return res.status(400).send({ status: false, message: "Kindly input all the nessesary details" });

    //========================= title =============================================================================================================
    if (!title)
      return res.status(400).send({ status: false, message: " Please input Title" });

    //------------------------- REGEX ---------------------------------------------------------------------------------------------------------------

    if (!/^[a-zA-Z ,]+$/i.test(title))
      return res.status(400).send({ status: false, message: "please input valid title and first letter must be of Uppercase" });

    //------------------------- DB call ------------------------------------------------------------------------------------------------------

    let uniqTitle = await bookModel.findOne({ title: title });

    if (uniqTitle)
      return res.status(400).send({ status: false, message: "This title already exists" });

    //===========================> validation for excerpt <===================================================================================================

    if (!excerpt)
      return res.status(400).send({ status: false, message: "input excerpt please" });

    if (typeof excerpt == "string" && excerpt.trim().length == 0)
      return res.status(400).send({ status: false, message: "input valid excerpt" });

    //============================> validation for UserID <================================================================================================

    if (!userId)
      return res.status(400).send({ status: false, message: "UserId is Mandatory" });

    //-----------------------------> REGEX <--------------------------------------------------------------------------------------------
    if (!userId.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).send({ status: false, message: "invalid userId given" });

    //-----------------------------> DB call <------------------------------------------------------------------------------------------------------
    if (!(await userModel.findById(userId)))
      return res.status(404).send({ status: false, message: "wrong userID" });

    //=============================> validation for ISBN <====================================================================================

    if (!ISBN)
      return res.status(400).send({ status: false, message: "ISBN mandatory" });

    if ((typeof ISBN == "string") && ISBN.trim().length == 0)
      return res.status(400).send({ status: false, message: "input valid ISBN" });
    //-----------------------------> REGEX <---------------------------------------------------------------------------------------------------------
    if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN))
      return res.status(400).send({ status: false, message: "Please input valid ISBN with 10 or 13 Numbers" });

    //-----------------------------> DB call <------------------------------------------------------------------------------------------------
    if (await bookModel.findOne({ ISBN: ISBN }))
      return res.status(400).send({ status: false, message: " ISBN already present" });

    //==============================> validation for category <================================================================================
    if (!category)
      return res.status(400).send({ status: false, message: "category is mandatory" });

    if ((typeof category == "string") && category.trim().length == 0)
      return res.status(400).send({ status: false, message: "enter  valid category" });

    //===============================> subcategory <========================================================================================

    if (!subcategory)
      return res.status(400).send({ status: false, message: "subcategory is mandatory" });

    if ((typeof subcategory == "string") && subcategory.trim().length == 0)
      return res.status(400).send({ status: false, message: "enter valid subcategory" });


    //======================================releasedAt============================================================================================

    if (!releasedAt)
      return res.status(400).send({ status: false, message: "releasedAt is mandatory" });

    if (!/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt))
      return res.status(400).send({ status: false, message: "please enter the valid date in format of 'YYYY-MM-DD' " })


    // calling next function --
    next();
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


// -----------------------review middleware------------------------------------------------------------------------
const reviewBook = async (req, res, next) => {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0) return res.status(500).send({ status: false, message: "plss put some data on body" });

    let { reviewedBy, rating, review } = data;

    //------------------------checking reviewedBy----------------------------------------------------------

    if (!/^[a-z ,.'-]+$/.test(reviewedBy))  // this regex is taking spaces between words.
      return res.status(400).send({ status: false, message: "enter reviewer name in lower cases only" });
    // -------------------checking rating--------------------------------------------
    if (!rating) return res.status(400).send({ status: false, message: "rating is mandatory" });

    if (!/^\s*([1-5]){1}\s*$/.test(rating)) return res.status(404).send({ status: false, message: "ratings is accept only 1 to 5 digit only" });

    // ------------checking review----------------------------------------------------
    if (!review) return res.status(400).send({ status: false, message: "review is mandatory" });

    next();

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


module.exports = { myValidUser, bookValidation, reviewBook };
