const express = require('express');
const router = express.Router();
const {authenticateUser,authorizePermissions} = require('../middleware/authentication')
const { getAllorders,getSingleOrder,getCurrentUserOrders,createOrder,updateOrder} = require('../controllers/orderController');


router.route('/').post(authenticateUser,createOrder)
.get(authenticateUser,authorizePermissions('admin'),getAllorders);

router.route('/showAllMyOrders').get(authenticateUser,getCurrentUserOrders)
router.route('/:id')
.get(authenticateUser,getSingleOrder)
.patch(authenticateUser,updateOrder)
 
module.exports = router;