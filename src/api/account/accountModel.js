const { accountSchema } = require('./accountSchema')
const mongoose = require('mongoose')
const moment = require('moment')
const ObjectId = mongoose.Types.ObjectId

class accountModel {
    async findOneAccount(obj) {
        try {
            const account = await accountSchema.findOne(obj)
                .populate({
                    path: 'transactions',
                    populate: { path: "account_id" },
                    options: { sort: { created_date: -1 } }
                })
            return { completed: true, account }
        } catch (error) {
            console.log(error)
            return { completed: false }
        }
    }

    async registerUser(obj) {
        try {
            const result = await accountSchema.create(obj)
            return { completed: true, result }
        } catch (error) {
            console.log(error)
            return { completed: false }
        }
    }

    async insertDevice(obj) {
        try {
            const { _id, device_id, token_noti } = obj
            const device_exist = await accountSchema.findOne({
                _id: ObjectId(_id),
                'device_info.divice_id': device_id
            })
            console.log(device_exist)
            if (!device_exist) {
                await accountSchema.findOneAndUpdate({ _id: ObjectId(_id) }, { $push: { device_info: obj } }, { upsert: true })
            } else {
                await accountSchema.findOneAndUpdate({ _id: ObjectId(_id), 'device_info.divice_id': device_id }, { $set: { 'device_info.$.token_noti': token_noti } }, { upsert: true })
            }
        } catch (error) {
            console.log(error)
        }
    }

    async updateUser(id, obj) {
        try {
            await accountSchema.findByIdAndUpdate(ObjectId(id), { ...obj })
            return { completed: true }
        } catch (error) {
            console.log(error)
            return { completed: false }
        }
    }
}

module.exports = new accountModel()