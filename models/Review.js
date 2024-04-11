const mongoose = require('mongoose');

const Review = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'please provide rating']
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100,
        required: [true, 'please provide review title']
    },
    comment: {
        type: String,
        required: [true, 'please provide review text']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }
}, {
    timestamps: true
});
Review.index({ product: 1, user: 1 }, { unique: true });

// statics is used on schema
Review.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
        {
            $match: {
                product: productId
            }
        }, {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 }
            }
        }
    ])
    console.log(result);
    try {
        await this.model('Product').findOneAndUpdate(
            { _id: productId },
            {
                averageRating: Math.ceil(result[0]?.averageRating || 0),
                numOfReviews: result[0]?.numOfReviews || 0
            }
        )
    } catch (error) {
        console.log(error);
    }
   
}

Review.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product)
})
Review.post('remove', async function () {
    await this.constructor.calculateAverageRating(this.product)

})

module.exports = mongoose.model('Review', Review);