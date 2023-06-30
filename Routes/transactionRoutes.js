/* eslint-disable comma-dangle */
/* eslint-disable semi */
const express = require('express')
const router = express.Router()

const {
  addMoney,
  withdrawMoney,
  tdsCount,
} = require('../Controller/transactionController')

router.post('/add-money', addMoney)
router.post('/withdraw-money', withdrawMoney)
router.post('/tds', tdsCount)

module.exports = router
