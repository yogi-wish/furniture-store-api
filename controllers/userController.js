const Users = require('../models/User')
const CustomError = require('../errors')
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require('../utils')


const getAllusers = async (req, res) => {
    const users = await Users.find({ role: 'user' }).select('-password')

    res.status(200).json({
        status: 'success',
        users
    })
}


const getSingleUser = async (req, res) => {
    const { id } = req.params;
    const users = await Users.findOne({ _id: id }).select('-password');

    if (!users) {
        throw new CustomError.NotFoundError(`No user belongs to id:${id}`)
    }
    checkPermissions(req.user, users._id)
    res.status(200).json({
        status: 'success',
        users
    })
}


const showCurrentUser = async (req, res) => {
    res.status(200).json({
        status: 'success',
        user: req.user
    })
}
const updateUser = async (req, res) => {
    // console.log(req.user); comming from authentication middleware
    const { name, email } = req.body;
    if (!name || !email) {
        throw new CustomError.BadRequestError('please provide name & email')
    }

    const user = await Users.findOneAndUpdate({ _id: req.user.userId }, { name: name, email: email }, { new: true, runValidators: true });

    // console.log(user);

    const tokenUser = createTokenUser(user);

    attachCookiesToResponse({ res, user: tokenUser })
    res.status(201).json({
        status: 'success',
        msg: 'user details updated!'
    })
}


const updateUserPassward = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please provide the passwords')
    }
    const user = await Users.findOne({ _id: req.user.userId });

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }
    user.password = newPassword;
    await user.save();

    res.status(201).json({
        status: 'success',
        msg: "Password Updated!"
    })
}

module.exports = {
    getAllusers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassward
}