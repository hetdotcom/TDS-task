/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
// const mongoose = require('mongoose')
const messages = require('../Messages')
// const User = require('../Model/userSchema')
// const Log = require('../Model/transactionSchema')
const Passbook = require('../Model/passbookSchema')

const addMoney = async (req, res) => {
  try {
    const { iUserId, nAmount, eTransactionType } = req.body

    console.log(req.body)

    const oUser = await Passbook.find({ iUserId: iUserId }).sort({
      createdAt: -1,
    })
    console.log(oUser[0])
    if (oUser) {
      if (eTransactionType === 'win') {
        oUser[0].nTotalBalance += nAmount
      } else if (eTransactionType === 'deposit') {
        console.log('entered')
        oUser[0].nDepositBalance += nAmount
      } else {
        return res
          .status(messages.status.badrequest)
          .json(messages.messages.winAdded)
      }

      const oPassbook = {
        iUserId: iUserId,
        nTotalBalance: oUser[0].nTotalBalance,
        nAmount: nAmount,
        eTransactionType: eTransactionType,
        nDepositBalance: oUser[0].nDepositBalance,
      }
      console.log(oPassbook)
      await new Passbook(oPassbook).save()
      //   await Passbook.create(oPassbook)
      //   console.log('hello')
      return res
        .status(messages.status.statusSuccess)
        .json(messages.messages.moneyAdded)
    } else {
      return res
        .status(messages.status.badrequest)
        .json(messages.messages.userNotPresent)
    }
  } catch (error) {
    console.log(error)
    return res
      .status(messages.status.internalServerError)
      .json(messages.messages.transactionFailed)
  }
}

module.exports = {
  addMoney,
}
