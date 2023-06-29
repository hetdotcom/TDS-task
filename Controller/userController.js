/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose')
const messages = require('../Messages')
const User = require('../Model/userSchema')
// const Log = require('../Model/transactionSchema')
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

    console.log(req.body)

    const oUser = await User.create([req.body], { session: session })
    // console.log(oUser)
    await Passbook.create(
      [
        {
          iUserId: oUser[0]._id,
        },
      ],
      { session: session }
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

module.exports = {
  addUser,
}
