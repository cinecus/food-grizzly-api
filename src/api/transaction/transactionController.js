const transactionModel = require('./transactionModel')
const accountModel = require('../account/accountModel')
const storeModel = require('../store/storeModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const { err, debug } = require('../../config/debug')
const { success, failed } = require('../../config/response')
const { encrypted, decrypted, generateToken } = require('../../functions')

class transactionController {
    async deposit(req, res) {
        try {
            const { amount } = req.body
            const lastest_transaction = await transactionModel.getLastestTransaction(req.account_id)
            const current_amount = (!!lastest_transaction ? lastest_transaction.current_amount : 0) + amount
            const transaction = await transactionModel.insertTransaction({
                type: 'deposit',
                account_id: req.account_id,
                ref_account_id: null,
                current_amount,
                amount
            })
            const { account } = await accountModel.findOneAccount({ _id: req.account_id })

            account.transactions.push(transaction._id)
            await account.save()

            return success(res, 'ฝากเงินสำเร็จแล้ว', { transaction })
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async withdraw(req, res) {
        try {
            const { amount } = req.body

            const lastest_transaction = await transactionModel.getLastestTransaction(req.account_id)
            if (!lastest_transaction) {
                return failed(res, 'เงินในบัญชีไม่เพียงพอ')
            }
            if (amount > lastest_transaction.current_amount) {
                return failed(res, 'เงินในบัญชีไม่เพียงพอ')
            }
            const current_amount = (!!lastest_transaction ? lastest_transaction.current_amount : 0) - amount
            const transaction = await transactionModel.insertTransaction({
                type: 'withdraw',
                account_id: req.account_id,
                ref_account_id: null,
                current_amount,
                amount
            })
            const { account } = await accountModel.findOneAccount({ _id: req.account_id })

            account.transactions.push(transaction._id)
            await account.save()

            return success(res, 'ถอนเงินสำเร็จแล้ว', { transaction })
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async transfer(req, res) {
        try {
            const { ref_account, amount } = req.body
            const { account } = await accountModel.findOneAccount({ _id: req.account_id })
            let account_ref
            if (ref_account.length === 24) {
                account_ref = (await accountModel.findOneAccount({ _id: ref_account })).account
            } else {
                account_ref = (await accountModel.findOneAccount({ username: ref_account })).account
            }
            if (ref_account === req.account_id || !account_ref) {
                return failed(res, 'เลขบัญชีผู้รับไม่ถูกต้อง')
            }
            const lastest_transaction = await transactionModel.getLastestTransaction(req.account_id)
            if (!lastest_transaction) {
                return failed(res, 'เงินในบัญชีไม่เพียงพอ')
            }
            const current_amount = (!!lastest_transaction ? lastest_transaction.current_amount : 0) - amount
            if (amount > lastest_transaction.current_amount) {
                return failed(res, 'เงินในบัญชีไม่เพียงพอ')
            }
            const lastest_transaction_ref = await transactionModel.getLastestTransaction(ref_account)
            const current_amount_ref = (!!lastest_transaction_ref ? lastest_transaction_ref.current_amount : 0) + amount
            const transaction = await transactionModel.insertTransaction({
                type: 'transfer',
                account_id: req.account_id,
                ref_account_id: ref_account,
                current_amount: current_amount,
                amount
            })
            const transaction_ref = await transactionModel.insertTransaction({
                type: 'receive',
                account_id: ref_account,
                ref_account_id: req.account_id,
                current_amount: current_amount_ref,
                amount
            })


            account.transactions.push(transaction._id)
            await account.save()


            account_ref.transactions.push(transaction_ref._id)
            await account_ref.save()

            return success(res, 'โอนเงินสำเร็จแล้ว', { transaction, transaction_ref })

        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async getBalance(req, res) {
        try {
            const balance = (await transactionModel.getLastestTransaction(req.account_id)).current_amount
            return success(res, 'ดึงยอดเงินคงเหลือสำเร็จ', balance)
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async reserve(req, res) {
        try {
            const { account_id, store_id, qty, reserve_time, type } = req.body
            //TODO เรียกข้อมูล account 
            const { account } = await accountModel.findOneAccount({ _id: ObjectId(account_id) })

            //TODO check ว่า account นั้นๆ จองร้านอื่นในช่วงเวลาเดียวกันหรือไม่
            const reserved_record = await transactionModel.getReserveTimeRecord({ account_id, reserve_time })

            if (reserved_record) {
                return failed(res, `ไม่สามารถจองร้านได้ เนื่องจากมีร้านที่จองไว้อยู่แล้วในเวลานี้`)
            }

            //TODO check ว่าเวลานั้น ร้านนั้น มีคนจองแล้วยัง
            const last_record = await transactionModel.getLastestRecord({ store_id, reserve_time })

            //TODO check maximum ของร้าน
            const { maximum } = await storeModel.getStoreByID(store_id)
            //ถ้าไม่มี record ในช่วงเวลานั้น จะ add transaction ได้เลย
            //ถ้ามี record แล้วจะเอา current_qty มา check
            let current_qty
            if (!last_record) {
                current_qty = maximum - qty
                if (current_qty < 0) {
                    return failed(res, `ไม่สามารถจองได้เนื่องจากที่นั่งเหลือ ${maximum} ที่`)
                }
            } else {
                current_qty = last_record.current_qty - qty
                if (current_qty < 0) {
                    return failed(res, `ไม่สามารถจองได้เนื่องจากที่นั่งเหลือ ${last_record.current_qty} ที่`)
                }
            }

            const transaction = await transactionModel.insertTransaction({ account_id, store_id, qty, reserve_time, type, current_qty })
            account.transactions.push(transaction._id)
            await account.save()
            return success(res, 'จองร้านสำเร็จ', transaction)
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }
}

module.exports = new transactionController()