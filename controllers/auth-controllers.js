const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const { ctrlWrapper } = require("../utils");

const {User} = require("../models/user");

const { HttpError } = require("../helpers");

const {SECRET_KEY} = process.env;

const register = async(req, res)=> {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(user){
        throw HttpError(409, "Email already in use")
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await User.create({...req.body, password: hashPassword});

    res.status(201).json({
        name: result.name,
        email: result.email,
    })
}

const login = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        throw HttpError(401, "Email or password invalid");
    }
    const passwordCompare = await bcrypt.compare(password, user.password)
    if(!passwordCompare){
        throw HttpError(401, "Email or password invalid" )
    }
    const payload = {
        id: user._id,
    }

const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"} )
await User.findByIdAndUpdate(user._id, {token})
    res.json({
        token,
    })
}

const getCurrent = async(req, res) => {
    const {name, email} = req.user;

    res.json({
        name,
        email,
    })
}



module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
}