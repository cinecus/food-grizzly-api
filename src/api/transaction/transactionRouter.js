const { Router } = require('express')
const { validate_token } = require('../../middleware/validate_token')
const transactionController = require('./transactionController')

const transactionRouter = Router()

transactionRouter.post('/deposit',
    validate_token(),
    transactionController.deposit
)

transactionRouter.post('/withdraw',
    validate_token(),
    transactionController.withdraw
)

transactionRouter.post('/transfer',
    validate_token(),
    transactionController.transfer
)

transactionRouter.get('/getBalance',
    validate_token(),
    transactionController.getBalance
)

module.exports = transactionRouter