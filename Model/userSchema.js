const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    sName: { type: String, require: true },
    nAmount: { type: Number, require: true },
  },
  { timestamps: true }
)
module.exports = mongoose.model('users', userSchema)
