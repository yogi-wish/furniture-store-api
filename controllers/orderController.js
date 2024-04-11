const Order = require('../models/Order');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = 'AWD638DBCDJ74HBFJ';
    return { client_secret, amount }
}

const getAllorders = async (req, res) => {
    const orders = await Order.find({});
    if (!orders) {
        throw new CustomError.NotFoundError('No orders exist')
    }
    checkPermissions(req.user, orders.user)
    res.status(StatusCodes.OK).json({ orders })
};
const getSingleOrder = async (req, res) => {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id });
    if (!order) {
        throw new CustomError.NotFoundError(`No orders exist with this id:${id}`)
    }
    res.status(StatusCodes.OK).json({ order })
};
const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user.userId });
    if (!orders) {
        throw new CustomError.NotFoundError('No orders exist for you');
    }
    res.status(StatusCodes.OK).json({ orders })
};
const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body;
    if (!cartItems || cartItems.length < 1) {
        throw new CustomError.BadRequestError('No cart items provided')
    }
    if (!tax || !shippingFee) {
        throw new CustomError.BadRequestError('Please provide tax and shipping Fee')
    }

    let orderItems = [];
    let subtotal = 0;

    for (let item of cartItems) {
        const dbProduct = await Product.findOne({ _id: item.product });
        if (!dbProduct) {
            throw new CustomError.NotFoundError(`No product with this id:${item.product}`)
        }
        const { name, price, image, _id } = dbProduct;
        const singleOrderItems = {
            amount: item.amount,
            name, price, image,
            product: _id
        }
        orderItems = [...orderItems, singleOrderItems];
        subtotal += item.amount * price;
    }
    const total = tax + shippingFee + subtotal;
    // get client secret
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'USD'
    });
    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId
    })
    res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret });
};
const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { paymentIntentId } = req.body;
    const order = await Order.findOne({ _id: id });
    if (!order) {
        throw new CustomError.NotFoundError('No orders exist')
    }
    checkPermissions(req.user, order.user);
    order.paymentIntentId = paymentIntentId;
    order.status = 'paid';
    await order.save();

    res.status(StatusCodes.OK).json({ order })
};

module.exports = {
    getAllorders,
    getSingleOrder,
    getCurrentUserOrders, createOrder,
    updateOrder
}