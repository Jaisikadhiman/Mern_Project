const mongoose = require("mongoose");
const EmployeSchema = mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  designation: {
    required: true,
    type: String,
  },
  age: {
    required: true,
    type: Number,
  },
  address: {
    required: true,
    type: String,
  },
  phone: {
    required: true,
    type: Number,
  },
  password: {
    required: true,
    type: String,
  },
  hobbies: [
    {
      required: true,
      type: String,
    },
  ],
  status: {
    required: true,
    type: String,
    enum: ["active", "inactive"],
  },
  gender: {
    required: true,
    type: String,
    enum: ["Male", "Female"],
  },
  image: {
    required: false,
    type: [String],
    default: "default-file-path",
  },
  document: {
    required: false,
    type: [String],
    default: "default-file-path",
  },
  profileImage: {
    required: false,
    type: String,
    // default: "default-file-path",
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'editor'], // Predefined roles
    // default: 'customer' // Default role if none is provided
  },
  dobTime: {
    type: String,
    required:true // Predefined roles
    // default: 'customer' // Default role if none is provided
  } ,otpHash: {
    type: String,
    default: null, // Store hashed OTP
  },
  otpExpiration: {
    type: Date,
    default: null, // Store OTP expiration time
  },
},
{
  timestamps:true,
});
const Employee = mongoose.model("Employee", EmployeSchema);
module.exports = { Employee };
