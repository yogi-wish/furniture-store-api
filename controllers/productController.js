const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path')

const createProduct = async (req, res) => {
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({
        status: 'success',
        product
    })
}
const getAllProducts = async (req, res) => {
    const product = await Product.find();
    res.status(StatusCodes.OK).json({
        status: 'success',
        product
    })
}
const getSingleProduct = async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id }).populate('review');

    if (!product) {
        throw new CustomError.NotFoundError(`no product exist with id:${req.params.id}`)
    }
    res.status(StatusCodes.OK).json({
        status: 'success',
        product
    })
}
const updateProduct = async (req, res) => {
    const product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true });

    if (!product) {
        throw new CustomError.NotFoundError(`no product exist with id:${req.params.id}`)
    }
    res.status(StatusCodes.OK).json({
        status: 'success',
        product
    })
}
const deleteProduct = async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });

    if (!product) {
        throw new CustomError.NotFoundError(`no product exist with id:${req.params.id}`)
    }

    await product.remove();
    res.status(StatusCodes.OK).json({
        status: 'success',
        msg: "product deleted"
    })
}
const uploadImage = async (req, res) => {
    console.log(req.files);
    if (!req.files) {
        throw new CustomError.BadRequestError('no file uploaded')
    }
    const productImage = req.files.image;
    if (!productImage.mimetype.startsWith('image')) {
        throw new CustomError.BadRequestError('please upload image')
    }
    const maxSize = 1024 * 1024;
    if(productImage.size > maxSize){
        throw new CustomError.BadRequestError('Please upload image smaller than 1MB')
    }

    const imagePath = path.join(__dirname,'../public/uploads/'+ `${productImage.name}`)
    await productImage.mv(imagePath);
    res.status(StatusCodes.OK).json({
        status:'success',
        image:`/uploads/${productImage.name}`
    })
}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}