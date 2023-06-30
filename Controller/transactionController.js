/* eslint-disable no-trailing-spaces */
/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
/* eslint-disable semi */
/* eslint-disable comma-dangle */

const mongoose = require('mongoose')
const messages = require('../Messages')
const Passbook = require('../Model/passbookSchema')
const Withdraw = require('../Model/withdrawSchema')
const TDS = require('../Model/tdsSchema')
// const User = require('../Model/userSchema')

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
          .json(messages.messages.invalidTransactionType)
      }

      const oPassbook = {
        iUserId: iUserId,
        nTotalBalance: oUser[0].nTotalBalance,
        nAmount: nAmount,
        eTransactionType: eTransactionType,
        nDepositBalance: oUser[0].nDepositBalance,
      }
      console.log(oPassbook)
      await Passbook.create(oPassbook)
      //   console.log('hello')
      return res
        .status(messages.status.statusSuccess)
        .json(messages.messages.moneyWithdrawn)
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

const withdrawMoney = async (req, res) => {
  try {
    const { iUserId, nAmount, eTransactionType } = req.body

    console.log(req.body)

    const oUser = await Passbook.find({ iUserId: iUserId }).sort({
      createdAt: -1,
    })
    console.log(nAmount)
    if (oUser) {
      if (oUser[0].nTotalBalance >= nAmount) {
        oUser[0].nTotalBalance -= nAmount
      } else {
        return res
          .status(messages.status.badrequest)
          .json(messages.messages.insufficientBalance)
      }
      const oPassbook = {
        iUserId: iUserId,
        nTotalBalance: oUser[0].nTotalBalance,
        nAmount: nAmount,
        eTransactionType: eTransactionType,
        nDepositBalance: oUser[0].nDepositBalance,
      }
      console.log(oPassbook)
      await Passbook.create(oPassbook)
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

const tdsCount = async (req, res) => {
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'majority' },
    writeConcern: { w: 'majority' },
  }
  const session = await mongoose.startSession(transactionOptions)
  try {
    const { dFirstDate, dLastDate, nAmount, nPercentage, iUserId } = req.body
    session.startTransaction()

    console.log(req.body)

    const nTotalWithdraw = await Passbook.aggregate(
      [
        {
          $match: {
            createdAt: {
              $gt: dFirstDate,
              $lt: dLastDate,
            },
          },
        },
        {
          $group: {
            _id: '$eTransactionType',
            nTotalWithdraw: {
              $sum: '$nAmount',
            },
          },
        },
        {
          $match: {
            _id: 'withdraw',
          },
        },
      ],
      { session: session }
    )

    let A = 0
    if (nTotalWithdraw.length) {
      A = nTotalWithdraw[0].nTotalWithdraw + nAmount
      console.log('A', A)
    } else {
      A = nAmount
      console.log('A', A)
    }

    const nTotalDeposit = await Passbook.aggregate(
      [
        {
          $match: {
            createdAt: {
              $gt: dFirstDate,
              $lt: dLastDate,
            },
          },
        },
        {
          $group: {
            _id: '$eTransactionType',
            nTotalDeposit: {
              $sum: '$nAmount',
            },
          },
        },
        {
          $match: {
            _id: 'deposit',
          },
        },
      ],
      { session: session }
    )

    // const B = nTotalDeposit[0].nTotalDeposit
    // console.log('B', B)
    let B = 0
    if (nTotalWithdraw.length) {
      B = nTotalDeposit[0].nTotalDeposit
      console.log('B', B)
    } else {
      console.log('B', B)
    }

    const aMonthData = await Passbook.find(
      {
        createdAt: {
          $gt: dFirstDate,
          $lt: dLastDate,
        },
      },
      {},
      { session }
    ).sort({ createdAt: -1 })
    // const aMonthData = await Passbook.find({
    //   createdAt: {
    //     $gt: dFirstDate,
    //     $lt: dLastDate,
    //   },
    // }).sort({ createdAt: -1 })
    const date = new Date(dLastDate)
    console.log(date, 'date')
    console.log(date - 30, 'date')
    console.log(date.getMonth() - 12, 'month')

    const C = aMonthData[0].nTotalBalance
    console.log('C', C)
    // console.log(C);

    const D = nAmount * 0.3
    console.log('D', D)

    const nTDS = A - B - C - D
    console.log('nTDS', nTDS)

    const nTdsAmount = nAmount * nPercentage
    const nOriginalAmount = nAmount - nAmount * nPercentage
    const tdsEntry = {
      iUserId: iUserId,
      nAmount: nTdsAmount,
      nOriginalAmount: nOriginalAmount,
      nPercentage: nPercentage,
    }
    // console.log(tdsEntry, 228)
    await TDS.create([tdsEntry], { session: session })

    const withdrawEntry = {
      iUserId: iUserId,
      nAmount: nAmount,
    }
    // console.log(withdrawEntry, 235)
    await Withdraw.create([withdrawEntry], { session: session })

    const isUserPresent = await Passbook.findOne(
      { iUserId: iUserId },
      {},
      { session: session }
    )
    if (isUserPresent) {
      let oUser = await Passbook.find(
        { iUserId: iUserId },
        {},
        { session: session }
      ).sort({ createdAt: -1 })
      
      const oWithdrawPassbook = {
        iUserId: iUserId,
        nTotalBalance: oUser[0].nTotalBalance - nOriginalAmount,
        nAmount: nOriginalAmount,
        eTransactionType: 'withdraw',
        nDepositBalance: oUser[0].nDepositBalance,
      }
      console.log(oWithdrawPassbook, 249)
      await Passbook.create(oWithdrawPassbook)

      oUser = await Passbook.find({ iUserId: iUserId }).sort({
        createdAt: -1,
      })
      console.log(oUser)
      const oTdsPassbook = {
        iUserId: iUserId,
        nTotalBalance: oUser[0].nTotalBalance - nTdsAmount,
        nAmount: nTdsAmount,
        eTransactionType: 'tds',
        nDepositBalance: oUser[0].nDepositBalance,
      }
      console.log(oTdsPassbook, 257)
      await Passbook.create(oTdsPassbook)
    } else {
      return res
        .status(messages.status.badrequest)
        .json(messages.messages.userNotPresent)
    }

    await session.commitTransaction()

    return res
      .status(messages.status.statusSuccess)
      .json(messages.messages.userAdded)
  } catch (error) {
    console.log(error)
    await session.abortTransaction()

    return res
      .status(messages.status.internalServerError)
      .json(messages.messages.userNotAdded)
  } finally {
    await session.endSession()
    console.log('Ended transaction session')
  }
}
module.exports = {
  addMoney,
  withdrawMoney,
  tdsCount,
}
