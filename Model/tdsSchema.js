/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable new-cap */
const mongoose = require('mongoose')

const tdsSchema = new mongoose.Schema({
  iUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },

  nAmount: {
    type: Number,
    default: 0,
  },

  nOriginalAmount: {
    type: Number,
    default: 0,
  },
  nPercentage: {
    type: Number,
    default: 0.3,
  },

  eStatus: {
    type: String,
    default: 'S',
  },
})

module.exports = new mongoose.model('tds', tdsSchema)
