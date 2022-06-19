const storeModel = require('./storeModel')
const accountModel = require('../account/accountModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const { err, debug } = require('../../config/debug')
const { success, failed } = require('../../config/response')
const { encrypted, decrypted, generateToken } = require('../../functions')
const transactionModel = require('../transaction/transactionModel')

class storeController {
    async createStore(req, res) {
        try {
            const store = await storeModel.createStore(req.body)
            return success(res, 'สร้างร้านอาหารสำเร็จ', { store })
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async getStoreByID(req, res) {
        try {
            const store = await storeModel.getStoreByID(req.params.store_id)
            const reserve_slot = await transactionModel.getReserveTimeByStore(req.params.store_id)
            return success(res, 'เรียกข้อมูลร้านอาหารสำเร็จ', { ...store, reserve_slot })
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async getStore(req, res) {
        try {
            const store = await storeModel.getStrore()
            return success(res, 'เรียกข้อมูลร้านอาหารสำเร็จ', { store })
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }
}



module.exports = new storeController()