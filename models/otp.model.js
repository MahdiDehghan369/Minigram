const mongoose = require('mongoose');


const otpSchema = new mongoose.Schema(
  {
   code: {
    type: String,
   },
   email: String,
   used: Boolean,
   expireAt: Date
  },
  { timestamps: true }
);


module.exports = mongoose.model("otp", otpSchema);
