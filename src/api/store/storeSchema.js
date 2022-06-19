const Joi = require('joi')
const mongoose = require('mongoose')

const storeSchema = mongoose.Schema({
    name: String,
    image: [String],
    maximum: Number,
    open: String,
    close: String,
    status: {
        type: Boolean,
        default: true
    },
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'transaction'
        }
    ],
    created_date: {
        type: Date,
        required: true,
        default: () => Date.now()
    },
    updated_date: {
        type: Date,
        required: true,
        default: () => Date.now()
    },
}, { collection: 'store' })

exports.storeSchema = mongoose.model('store', storeSchema)