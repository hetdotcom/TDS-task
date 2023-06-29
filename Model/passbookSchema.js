const mongoose = require('mongoose')

const passbookSchema = new mongoose.Schema(
  {
    iUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      require: true,
    },
    // nAmount: { type: Number, require: true },
    nAmount: {
      type: Number,

    },
    
    sDescription: String
  },

  { timestamps: true }
)
module.exports = mongoose.model('passbooks', passbookSchema)
