const Joi = require('joi')
const mongoose = require('mongoose')

const transactionSchema = mongoose.Schema({
    type: String,
    account_id: mongoose.Schema.Types.ObjectId,
    ref_account_id: mongoose.Schema.Types.ObjectId,
    amount: Number,
    current_amount: Number,
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