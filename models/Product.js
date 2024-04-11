const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'please provide product name'],
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'please provide product price'],
        default: 0
    },
    description: {
        type: String,
        required: [true, 'please provide product description'],
        maxlength: [1000, 'Description can not be more than 100 characters']
    },
    image: {
        type: String,
        default: '/uploads/example.jpeg'
    },
    category: {
        type: String,
        required: [true, 'please provide product category'],
        enum: ['office', 'kitchen', 'bedroom']
    },
    company: {
        type: String,
        required: [true, 'please provide product company'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} is not supported'
        }
    },
    colors: {
        type: [String],
        default: ['#fff'],
        required: true,

    },
    featured: {
        type: Boolean,
        default: false
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    inventory: {
        type: Number,
        required: true,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        require: true
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

Product.virtual('review', {
    ref: 'review',
    localField: "_id",
    foreignField: 'product',
    justOne: false,
    // match: { rating: 5 }
})
Product.pre('remove',async function(){
    await this.model('review').deleteMany({product:this._id})
})

module.exports = mongoose.model('Product', Product)