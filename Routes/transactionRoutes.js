/* eslint-disable comma-dangle */
/* eslint-disable semi */
const express = require('express')
const router = express.Router()

const {
  addMoney,
} = require('../Controller/transactionController')

router.post('/add-money', addMoney)

module.exports = router
