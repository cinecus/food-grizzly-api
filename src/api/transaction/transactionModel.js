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

    async getLastestRecord(obj) {
        const { store_id, reserve_time } = obj
        try {
            const lastest_transaction = await transactionSchema.findOne({
                store_id: ObjectId(store_id),
                reserve_time: reserve_time,
                created_date: {
                    $gt: new Date(moment(`${moment().format('YYYY-MM-DD')}`)),
                    $lt: new Date(moment(`${moment().add(1, 'day').format('YYYY-MM-DD')}`))
                }
            }).sort({ _id: -1 })
            return lastest_transaction
        } catch (error) {
            console.log(error)
            return { completed: false }
        }
    }

    async getReserveTimeRecord(obj) {
        const { account_id, reserve_time } = obj
        try {
            const reserved_transaction = await transactionSchema.findOne({
                account_id: ObjectId(account_id),
                reserve_time: reserve_time,
                created_date: {
                    $gt: new Date(moment(`${moment().format('YYYY-MM-DD')}`)),
                    $lt: new Date(moment(`${moment().add(1, 'day').format('YYYY-MM-DD')}`))
                }
            }).sort({ _id: -1 })
            return reserved_transaction
        } catch (error) {
            console.log(error)
            return { completed: false }
        }
    }


    async getReserveTimeByStore(store_id) {
        try {
            const pipeline = [
                {
                    '$match': {
                        'store_id': ObjectId(store_id),
                        'created_date': {
                            $gt: new Date(moment(`${moment().format('YYYY-MM-DD')}`)),
                            $lt: new Date(moment(`${moment().add(1, 'day').format('YYYY-MM-DD')}`))
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$reserve_time',
                        'current_qty': {
                            '$last': '$current_qty'
                        }
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'reserve_time': '$_id',
                        'current_qty': 1
                    }
                }
            ]
            const reserve_time = await transactionSchema.aggregate(pipeline)
            return reserve_time
        } catch (error) {
            console.log(error)
            return { completed: false }
        }
    }
}

module.exports = new transactionModel()