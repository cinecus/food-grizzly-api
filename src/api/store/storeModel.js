const { storeSchema } = require('./storeSchema')
const mongoose = require('mongoose')
const moment = require('moment')
const ObjectId = mongoose.Types.ObjectId

class storeModel {
    async createStore(obj) {
        try {
            const store = await storeSchema.create(obj)
            return store
        } catch (error) {
            console.log(error)
        }
    }

    async getStoreByID(store_id) {
        try {
            const store = await storeSchema.findById(ObjectId(store_id)).lean()
            return store
        } catch (error) {
            console.log(error)
        }
    }

    async getStrore() {
        try {
            const store = await storeSchema.find({})
            return store
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = new storeModel()