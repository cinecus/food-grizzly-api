const { Router } = require('express')
const { validate_token } = require('../../middleware/validate_token')
const storeController = require('./storeController')

const storeRouter = Router()

storeRouter.post('/create', storeController.createStore)
storeRouter.get('/getStore/:store_id', storeController.getStoreByID)
storeRouter.get('/getStore', storeController.getStore)



module.exports = storeRouter