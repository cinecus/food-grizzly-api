const accountModel = require('./accountModel')
const transactionModel = require('../transaction/transactionModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const { err, debug } = require('../../config/debug')
const { success, failed } = require('../../config/response')
const { encrypted, decrypted, generateToken } = require('../../functions')

class accountController {
    async register(req, res) {
        try {
            const { username, password, first_name, last_name, email } = req.body
            const check_user = await accountModel.findOneAccount({ username: username })
            const password_encrypted = await encrypted(password)
            if (check_user.completed && !check_user.account) {
                const { result } = await accountModel.registerUser({ username, password: password_encrypted, first_name, last_name, email })
                generateToken(req, result._id)
                return success(res, 'สมัครสมาชิกสำเร็จ', { account: result, token_id: req.token })
            } else {
                return failed(res, 'มีผู้ใช้ username นี้ในระบบแล้ว')
            }
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async login(req, res) {

        const { username, password } = req.body
        try {
            const check_user = await accountModel.findOneAccount({ username })
            if (check_user.completed && !!check_user.account) {
                const compare_password = await decrypted(check_user.account.password, password)
                if (!compare_password) {
                    return failed(res, 'username หรือ password ไม่ถูกต้อง')
                }
                generateToken(req, check_user.account._id)
                return success(res, "เข้าสู่ระบบเรียบร้อย", { user: check_user.account, token_id: req.token })
            } else {
                return failed(res, 'username หรือ password ไม่ถูกต้อง')
            }
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }

    }

    async getInfo(req, res) {
        try {
            const account_id = req.account_id
            const { account } = await accountModel.findOneAccount({ _id: account_id })
            const balance = (await transactionModel.getLastestTransaction(req.account_id)).current_amount
            return success(res, "ดึงข้อมูลผู้ใช้สำเร็จ", { balance, account, })
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async getCheckAccount(req, res) {
        try {
            const { ref_account } = req.body
            let account
            if (ref_account.length == 24) {
                account = (await accountModel.findOneAccount({ _id: ref_account })).account
            } else {
                account = (await accountModel.findOneAccount({ username: ref_account })).account
            }
            if (!account) {
                return failed(res, 'username หรือ เลขบัญชีผู้รับไม่ถูกต้อง')
            }
            return success(res, "ดึงข้อมูลผู้ใช้สำเร็จ", { account: account ? account : account_username })
        } catch (error) {
            debug(error)
            return failed(res, 'found some issue on action')
        }
    }

    async logout(req, res) {
        try {

        } catch (error) {

        }
    }
}

module.exports = new accountController()