const mongoose = require('mongoose')
const messages = require('../Messages')
const User = require('../Model/userSchema')
const Log = require('../Model/transactionSchema')
const Passbook = require('../Model/passbookSchema')

const addUser = async (req, res) => {
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'majority' },
    writeConcern: { w: 'majority' },
  }
  const session = await mongoose.startSession(transactionOptions)
  try {
    session.startTransaction()
    req.body.nAmount = 1000
    console.log(req.body)

    const oUser = await User.create([req.body], { session })
    // console.log(oUser)
    await Passbook.create(
      [
        {
          iUser: oUser[0]._id,
          nAmount: oUser[0].nAmount,
          sDescription: 'kya kijiyega itni dhanrashi ka??',
        },
      ],
      { session }
    )
    await session.commitTransaction()

    return res
      .status(messages.status.statusSuccess)
      .json({ oUser, sMessage: messages.messages.userAdded })
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

//////////////////////////// * Manual Transaction * ////////////////////////////
const manualTransaction = async (req, res) => {
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'majority' },
    writeConcern: { w: 'majority' },
  }
  const session = await mongoose.startSession(transactionOptions)
  try {
    const { iSender, iReceiver, nAmount } = req.body

    const oSender = await User.findOne({ _id: iSender }, {}, { session })
    const oReceiver = await User.findOne({ _id: iReceiver }, {}, { session })
    // console.log(oSender)

    if (oSender && oReceiver) {
      //start session
      //   session = await mongoose.startSession()
      session.startTransaction()

      if (oSender.nAmount < nAmount) {
        return res
          .status(messages.status.badrequest)
          .json(messages.messages.insufficientBalance)
      }
      oSender.nAmount -= nAmount
      oReceiver.nAmount += nAmount

      await Log.create([req.body], {}, { session })

      await oSender.save({ session })
      await oReceiver.save({ session })

      //   console.log(updatedReceiver, updatedSender)

      await session.commitTransaction()

      return res
        .status(messages.status.statusSuccess)
        .json(messages.messages.transactionDone)
    } else {
      return res
        .status(messages.status.badrequest)
        .json(messages.messages.userNotPresent)
    }
  } catch (error) {
    console.log(error)
    await session.abortTransaction()
    return res
      .status(messages.status.internalServerError)
      .json(messages.messages.transactionFailed)
  } finally {
    await session.endSession()
    console.log('Ended transaction session')
  }
}

/////////////////////////// * Automatic Transaction * //////////////////////////
const withTransaction = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const transactionOptions = {
      readPreference: 'primary',
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority' },
    }

    const { iSender, iReceiver, nAmount } = req.body

    const oSender = await User.findOne({ _id: iSender }, {}, { session })
    const oReceiver = await User.findOne({ _id: iReceiver }, {}, { session })
    console.log(oSender)

    if (oSender && oReceiver) {
      //start session
      //   session = await mongoose.startSession()
      const transactionResult = await session.withTransaction(async () => {
        if (oSender.nAmount < nAmount) {
          return res
            .status(messages.status.badrequest)
            .json(messages.messages.insufficientBalance)
        }
        oSender.nAmount -= nAmount
        oReceiver.nAmount += nAmount

        await Log.create([req.body], { session })

        await oSender.save({ session })
        await oReceiver.save({ session })
      }, transactionOptions)
      return res.status(messages.status.statusSuccess).json({
        transactionResult,
        sMessage: messages.messages.transactionDone,
      })
    } else {
      return res
        .status(messages.status.badrequest)
        .json(messages.messages.userNotPresent)
    }
  } catch (error) {
    console.log(error)
    // await session.abortTransaction()
    return res
      .status(messages.status.internalServerError)
      .json(messages.messages.transactionFailed)
  } finally {
    await session.endSession()
    console.log('Ended transaction session')
  }
}

const twoSessions = async (req, res) => {
  const session_1 = await mongoose.startSession()
  const session_2 = await mongoose.startSession()
  try {
    session_1.startTransaction()
    session_2.startTransaction()

    const oUser_1 = await User.findOneAndUpdate(
      { _id: req.body.iUser },
      { $inc: { nAmount: 1 } },
      { session_1 }
    )
    // console.log(oUser_1)
    const oUser_2 = await User.findOneAndUpdate(
      { _id: req.body.iUser },
      { $inc: { nAmount: 1 } },
      { session_2 }
    )
    // console.log(oUser_2)

    return res
      .status(messages.status.statusSuccess)
      .json({ sMessage: messages.messages.userAdded })
  } catch (error) {
    console.log(error)
    // await session_1.abortTransaction()
    await session_2.abortTransaction()
    return res
      .status(messages.status.internalServerError)
      .json(messages.messages.transactionFailed)
  } finally {
    await session_1.endSession()
    await session_2.endSession()
    console.log('Ended transaction session')
  }
}
module.exports = {
  addUser,
  manualTransaction,
  withTransaction,
  twoSessions,
}
