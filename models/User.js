const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require("bcryptjs")

const Users = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide the name'],
        minlength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide the email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        },
    },
    password: {
        type: String,
        required: [true, 'Please provide the password'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

Users.pre('save', async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

Users.methods.comparePassword = async function (cadidatePassword) {
    const isMatch = await bcrypt.compare(cadidatePassword, this.password);
    return isMatch;
}

module.exports = mongoose.model('User', Users)