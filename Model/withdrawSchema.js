/* eslint-disable comma-dangle */
/* eslint-disable semi */
const mongoose = require('mongoose')

const withdrawSchema = new mongoose.Schema(
  {
    iUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },

    nAmount: { type: Number },

    eStatus: {
      type: String,
      default: 'S',
    },
  },
  { timestamps: true }
)
module.exports = mongoose.model('withdraws', withdrawSchema)
