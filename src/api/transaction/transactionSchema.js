const Joi = require('joi')
const mongoose = require('mongoose')

const transactionSchema = mongoose.Schema({
    account_id: mongoose.Schema.Types.ObjectId,
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'store'
    },
    qty: Number,
    current_qty: Number,
    type: String,
    reserve_time: String,
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
}, { collection: 'transaction' })

exports.transactionSchema = mongoose.model('transaction', transactionSchema)