const mongoose = require("mongoose");
const ResetSchema = mongoose.Schema({
  
  email: {
    required: true,
    type: String,
  },
  token: {
    required: true,
    type: String,
  },
  
});
const Reset = mongoose.model("Reset", ResetSchema);
module.exports = {Reset};
