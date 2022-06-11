const transactionModel = require('./transactionModel')
const accountModel = require('../account/accountModel')
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
}

module.exports = new transactionController()