const CustomError = require('../errors');

const checkPermissions = (requestUser, resourceUserId) => {
    // console.log(requestUser, resourceUserId, typeof requestUser);
    if (requestUser.role === 'admin') return;
    if (requestUser.userId === resourceUserId.toString()) return;
    throw new CustomError.UnauthenticatedError('you are not allowed to perform this action on this route')
}

module.exports = {
    checkPermissions
}