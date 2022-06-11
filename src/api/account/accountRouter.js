const { Router } = require('express')
const { validate_token } = require('../../middleware/validate_token')
const accountController = require('./accountController')

const accountRouter = Router()

accountRouter.post('/register',
    accountController.register
)

accountRouter.post('/login',
    accountController.login
)

accountRouter.get('/getInfo',
    validate_token(),
    accountController.getInfo
)

accountRouter.post('/getCheckAccount',
    validate_token(),
    accountController.getCheckAccount
)

module.exports = accountRouter