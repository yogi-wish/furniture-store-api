const Review = require('../models/Review');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils')


const createReview = async (req, res) => {
    const { product: productId } = req.body;
    const isValidProduct = await Product.findOne({ _id: productId });

    if (!isValidProduct) {
        throw new CustomError.NotFoundError(`No product with id:${productId}`)
    }

    // a user already submitted a review for specific product
    const alreadySubmitted = await Review.findOne({
        product: productId, user: req.user.userId
    })

    if (alreadySubmitted) {
        throw new CustomError.BadRequestError('already submitted the review for this product')
    }

    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({})
        .populate({ path: 'product', select: "name company price" })
        .populate({ path: 'user', select: "name role" })
    res.status(StatusCodes.OK).json({ reviews })
}
const getSingleReview = async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id });
    if (!review) {
        throw new CustomError.NotFoundError(`No review with id:${req.params.id}`)
    }
    res.status(StatusCodes.OK).json({ review })
}
const updateReview = async (req, res) => {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const review = await Review.findOne({ _id: id });
    if (!review) {
        throw new CustomError.NotFoundError(`No review with id:${req.params.id}`)
    }
    checkPermissions(req.user, review.user);
    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();
    res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
    const { id } = req.params;
    const review = await Review.findOne({ _id: id });
    if (!review) {
        throw new CustomError.NotFoundError(`No review with id:${req.params.id}`)
    }
    // console.log(req.user, review.user);
    checkPermissions(req.user, review.user);
    await review.remove();
    res.status(StatusCodes.OK).json({ msg: "review deleted successfully" })
}

const getSingleProductReviews = async (req, res) => {
    const {id:productId} = req.params;
    const reviews = await Review.find({product:productId});
    res.status(StatusCodes.OK).json({reviews})
}

module.exports = {
    createReview,
    getAllReviews, getSingleReview,
    updateReview, deleteReview,
    getSingleProductReviews
}