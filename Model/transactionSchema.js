const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  iSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },

  iReceiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },

  nAmount: { type: Number, required: true },
})

module.exports = new mongoose.model('transactions', transactionSchema)