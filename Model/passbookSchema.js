/* eslint-disable semi */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose')

const passbookSchema = new mongoose.Schema(
  {
    iUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },

    nTotalBalance: {
      type: Number,
      default: 0,
    },

    nAmount: {
      type: Number,
      default: 0,
    },

    eStatus: {
      type: String,
      default: 'S',
    },

    eTransactionType: {
      type: String,
      enum: ['deposit', 'win', 'withdraw', 'tds'],
    },

    nDepositBalance: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
)
module.exports = mongoose.model('passbooks', passbookSchema)
