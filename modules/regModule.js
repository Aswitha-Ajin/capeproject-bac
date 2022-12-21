const mongo = require('../connect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req,res,next) => {
    try{

    // Email already exists validation
    const existUser = await mongo.selectedDb.collection('users').findOne({email: req.body.email});
    if(existUser){
     return res.status(400).send({msg : "You are already a registered User"})
    }
    // Confirm Password Checking
    const confirmed = await checkPassword(req.body.password, req.body.confirmpassword);
    if(!confirmed) return res.status(400).send({msg : "password didn't match"})

    // Password Hashing
    const randomString = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, randomString);

    // Save in DB
    const savedResponse = await mongo.selectedDb.collection('users').insertOne({...req.body});
    res.send(savedResponse);
}catch(err){
    console.log(err);
    res.status(500).send(err)
}
}
const checkPassword = async (password, confirmpassword) => {
    return(password !== confirmpassword?false:true)
}

exports.signin = async (req,res,next) => {

    // Validate Email
    const existUser = await mongo.selectedDb.collection('users').findOne({email : req.body.email})
    if(!existUser) return res.status(500).send({msg: "You are not a registered user"})

    // Password Validation
    const isValid = await bcrypt.compare(req.body.password, existUser.password )
    if(!isValid) return res.status(500).send({msg : "Password didn't match"})

    // Generate and send the token
    const token = jwt.sign(existUser, process.env.SECRET_KEY, {expiresIn : '10m'});
    res.send(token);
}