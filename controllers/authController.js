const Users = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { createJWT, attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
    const { email, name, password } = req.body;

    const emailAlreadyExist = await Users.find({ email });

    if (Array.isArray(emailAlreadyExist).length > 0) {
        throw new CustomError.BadRequestError('Email already exist')
    }

    // first registerd user is an admin
    const isFirstAccount = await Users.countDocuments({}) === 0;
    const role = isFirstAccount ? 'admin' : 'user';
    const user = await Users.create({ name, email, password, role });
    const tokenUser = createTokenUser(user);

    attachCookiesToResponse({ res, user: tokenUser })
    res.status(201).json({
        status: 'success',
        user: tokenUser,
    })
}
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.log(email, password);
        throw new CustomError.BadRequestError('Please provide email and passsword');
    }

    const user = await Users.findOne({ email: email });
    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credential')
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credential')
    }
    const tokenUser = createTokenUser(user);

    attachCookiesToResponse({ res, user: tokenUser })
    res.status(201).json({
        status: 'success',
        users: tokenUser,
    })
}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.status(200).json({
        status: 'success',
        msg: 'user logged out!'
    })
}

module.exports = {
    register, login, logout
}