const Joi = require('joi')
const mongoose = require('mongoose')
const moment = require('moment')

const accountSchema = mongoose.Schema({
    authen_id: String,  //for third party OAuth
    first_name: String,
    last_name: String,
    username: String,
    password: String,
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
}, { collection: 'account' })

exports.accountSchema = mongoose.model('account', accountSchema)

exports.sch_register = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
})