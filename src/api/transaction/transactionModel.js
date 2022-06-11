const { transactionSchema } = require('./transactionSchema')
const mongoose = require('mongoose')
const moment = require('moment')
const ObjectId = mongoose.Types.ObjectId

class transactionModel {
    async insertTransaction(obj) {
        try {
            const transaction = await transactionSchema.create(obj)
            return transaction
        } catch (error) {
            console.log(error)
            return { completed: false }
        }
    }

    async getLastestTransaction(account_id) {
        try {
            const lastest_transaction = await transactionSchema.findOne({ account_id: ObjectId(account_id) }).sort({ created_date: -1 })
            return lastest_transaction
        } catch (error) {
            console.log(error)
            return { completed: false }
        }
    }

}

module.exports = new transactionModel()