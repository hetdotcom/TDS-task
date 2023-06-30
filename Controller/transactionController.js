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
    console.log(oUser[0], 'passbook')
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
              $gt: new Date(dFirstDate),
              $lt: new Date(dLastDate),
            },
          },
        },
        {
          $group: {
            _id: { eTransaction: '$eTransactionType', Uid: '$iUserId' },
            nTotalWithdraw: {
              $sum: '$nAmount',
            },
          },
        },
        {
          $match: {
            $or: [
              { '_id.eTransaction': 'withdraw' },
              { '_id.eTransaction': 'tds' },
            ],
          },
        },
      ],
      { session: session }
    )
    console.log(nTotalWithdraw, 'withdraw')
    let A = 0
    if (nTotalWithdraw.length) {
      nTotalWithdraw.forEach((element) => {
        A += element.nTotalWithdraw
      })
      A = A + nAmount
      console.log('A', A)
    } else {
      A = nAmount
      console.log('!A', A)
    }

    // const oData = await Passbook.find()
    // console.log(oData);
    const nTotalDeposit = await Passbook.aggregate(
      [
        {
          $match: {
            createdAt: {
              $gt: new Date(dFirstDate),
              $lt: new Date(dLastDate),
            },
          },
        },
        {
          $group: {
            _id: { eTransaction: '$eTransactionType', Uid: '$iUserId' },
            nTotalDeposit: {
              $sum: '$nAmount',
            },
          },
        },
        {
          $match: {
            '_id.eTransaction': 'deposit',
          },
        },
      ],
      { session: session }
    )

    // const B = nTotalDeposit[0].nTotalDeposit
    // console.log('B', B)
    let B = 0
    if (nTotalDeposit.length) {
      B = nTotalDeposit[0].nTotalDeposit
      console.log('B', B)
    } else {
      console.log('!B', B)
    }

    // const aMonthData = await Passbook.find(
    //   {
    //     createdAt: {
    //       $gt: dFirstDate,
    //       $lt: dLastDate,
    //     },
    //   },
    //   {},
    //   { session }
    // ).sort({ createdAt: -1 })
    // const aMonthData = await Passbook.find({
    //   createdAt: {
    //     $gt: dFirstDate,
    //     $lt: dLastDate,
    //   },
    // }).sort({ createdAt: -1 })

    const oOpeningBalance = await Passbook.find(
      {
        createdAt: { $lt: dFirstDate },
      },
      {},
      { session }
    ).sort({ createdAt: -1 })
    let C = 0
    console.log(oOpeningBalance)
    if (oOpeningBalance.length) {
      C = oOpeningBalance[0].nTotalBalance
      console.log('C', C)
    } else {
      console.log('!C', C)
    }

    const nTotalTds = await Passbook.aggregate(
      [
        {
          $match: {
            createdAt: {
              $gt: new Date(dFirstDate),
              $lt: new Date(dLastDate),
            },
          },
        },
        {
          $group: {
            _id: { eTransaction: '$eTransactionType', Uid: '$iUserId' },
            nTotalTds: {
              $sum: '$nAmount',
            },
          },
        },
        {
          $match: {
            '_id.eTransaction': 'withdraw',
          },
        },
      ],
      { session: session }
    )
    console.log(nTotalTds)
    // const D = nTotalTds[0].nTotalTds * nPercentage
    let D = 0
    if (nTotalTds.length) {
      D = nTotalTds[0].nTotalTds * nPercentage
      console.log('D', D)
    } else {
      console.log('!D', D)
    }

    const nTaxableAmount = A - B - C - D
    console.log('nTaxableAmount', nTaxableAmount)

    const nTDS = nTaxableAmount * nPercentage
    console.log('nTDS', nTDS)

    // ////////////////////////////////////////////////////////////////////////

    const nTdsAmount = nAmount * nPercentage
    const nPayableAmount = nAmount - nAmount * nPercentage
    const nOriginalAmount = nAmount - nTDS
    const tdsEntry = {
      iUserId: iUserId,
      nAmount: nTdsAmount,
      nOriginalAmount: nPayableAmount,
      nPercentage: nPercentage,
    }
    // console.log(tdsEntry, 228)
    await TDS.create([tdsEntry], { session: session })

    const withdrawEntry = {
      iUserId: iUserId,
      nAmount: nOriginalAmount,
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
      // console.log(oWithdrawPassbook, 249)
      await Passbook.create(oWithdrawPassbook)

      oUser = await Passbook.find({ iUserId: iUserId }).sort({
        createdAt: -1,
      })
      // console.log(oUser)
      const oTdsPassbook = {
        iUserId: iUserId,
        nTotalBalance: oUser[0].nTotalBalance - nTdsAmount,
        nAmount: nTdsAmount,
        eTransactionType: 'tds',
        nDepositBalance: oUser[0].nDepositBalance,
      }
      // console.log(oTdsPassbook, 257)
      await Passbook.create(oTdsPassbook)
    } else {
      return res
        .status(messages.status.badrequest)
        .json(messages.messages.userNotPresent)
    }

    await session.commitTransaction()

    return res
      .status(messages.status.statusSuccess)
      .json(messages.messages.transactionDone)
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
