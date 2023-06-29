/* eslint-disable comma-dangle */
/* eslint-disable semi */
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    sName: { type: String, require: true },
    nMobile: { type: Number, require: true },
  },
  { timestamps: true }
)
module.exports = mongoose.model('users', userSchema)
