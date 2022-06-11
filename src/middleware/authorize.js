const { failed } = require('../config/response')
const accountModel = require('../api/account/accountModel')

exports.authorize = (key) => async (req, res, next) => {
    try {
        const { id } = req.body
        const { user } = await accountModel.findOneUser({ _id: req.user_id })

        const find_index = user[key].findIndex(elem => elem.toString() === id)
        if (find_index === -1) {
            return failed(res, 'Not Authorize')
        }
        next()
    } catch (error) {
        return failed(res, error)
    }
}