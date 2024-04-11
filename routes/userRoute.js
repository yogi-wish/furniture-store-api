const express = require('express');
const router = express.Router();
const { getAllusers, getSingleUser, showCurrentUser, updateUser, updateUserPassward } = require('../controllers/userController')
const { authenticateUser, authorizePermissions } = require('../middleware/authentication')

router.route('/').get(authenticateUser, authorizePermissions('admin'), getAllusers);

router.route('/showMe').get(authenticateUser, showCurrentUser)
router.route('/updateUser').post(authenticateUser, updateUser)
router.route('/updateUserPassword').post(authenticateUser, updateUserPassward)

router.route('/:id').get(authenticateUser, getSingleUser)


module.exports = router;