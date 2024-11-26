const { Employee } = require("../Model/Employe");
const bcrypt = require("bcrypt");
const { query } = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { Reset } = require("../Model/REset");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs").promises;
// const salt = 3;
// const Employee = require("../Model/Employe.js");
const SECRET_KEY = "45uhdfg765dcfvj";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "image") {
      cb(null, "uploads/");
    } else if (file.fieldname === "document") {
      cb(null, "documents/");
    } else if (file.fieldname === "profileImage") {
      cb(null, "profileImages/");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    file.mimetype === "image/jpeg" || file.mimetype === "image/png"
      ? cb(null, true)
      : cb(null, false);
  } else if (file.fieldname === "document") {
    file.mimetype === "application/msword" ||
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(null, false);
  } else if (file.fieldname === "profileImage") {
    file.mimetype === "image/jpeg" || file.mimetype === "image/png"
      ? cb(null, true)
      : cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter }).fields([
  { name: "image", maxCount: 5 },
  { name: "document", maxCount: 5 },
  { name: "profileImage", maxCount: 1 },
]);

const Register = async (req, resp) => {
  try {
    const {
      name,
      email,
      designation,
      age,
      address,
      phone,
      password,
      hobbies,
      status,
      gender,
      // image = req.files['image'] ? req.files['image'][0] : null,
      role,
      dobTime,
      //  document= req.files['document'] ? req.files['document'][0] : null,
      // document = req.file ? req.file.filename : null,
    } = req.body;

    // const image = req.files['image'] ? req.files['image'][0].filename : null;
    //   const document = req.files['document'] ? req.files['document'][0].filename : null;
    //   console.log("image:  ",image);
    //   console.log("document:  ",document);
    // console.log(req.body);

    const images = req.files["image"]
      ? req.files["image"].map((file) => file.filename)
      : [];
    const documents = req.files["document"]
      ? req.files["document"].map((file) => file.filename)
      : [];

    // const file = req.file ? req.file.path : "default-file-path";
    // const file = req.file ? req.file.path : null;
    const salt = await bcrypt.genSalt(3);
    const pass = await bcrypt.hash(password, 3);
    const data = await Employee.create({
      name,
      email,
      designation,
      age,
      address,
      phone,
      password: pass,
      hobbies,
      status,
      gender,
      image: images,
      role,
      dobTime,
      document: documents,
    });
    // console.log(req.filedocument);
    data.save();
    // if (data) {
    //   // const token = jwt.sign({ data }, SECRET_KEY, { expiresIn: "5000S" });
    //   resp.status(200).json({
    //     message: "successfully registered",
    //     success: true,
    //     data: data,
    //     // token: token,
    //   });
    // }
    resp.status(200).json({
      message: "successfully registered",
      success: true,
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const Login = async (req, resp) => {
  const email = req.query.email || "";
  const password = req.query.password || "";
  // let query={}
  // const { email, password } = req.body;
  const data = await Employee.findOne({ email: email });
  //  console.log("data.email"+" "+req.body.email);
  //  console.log("email"+" "+email)
  if (data.email === email) {
    const match = await bcrypt.compare(password, data?.password);
    if (match) {
      const token = jwt.sign({ data }, SECRET_KEY, { expiresIn: "50s" });
      resp.status(200).json({
        success: true,
        message: "login successfully",
        data: data,
        token: token,
      });
    } else {
      resp.status(400).json({
        message: "password not match",
        data: data,
      });
    }
  } else {
    resp.status(400).json({
      message: "email not match",
      data: data,
    });
  }
};

const editProfile = async (req, resp) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return resp
      .status(401)
      .json({ message: "No token provided or invalid format" });
  }
  const token = authHeader.split(" ")[1];

  const decoded = jwt.decode(token);
  console.log(decoded);
  const empId = decoded.data._id;

  let img = "";
  const employee = await Employee.findById(empId);
  if (!employee) {
    return resp.status(404).json({ message: "Employee not found" });
  }

  // Check if a new profile image is uploaded
  if (req.files && req.files.profileImage) {
    img = req.files.profileImage[0].filename; // Save the filename in the database

    // Delete the old profile image file if it exists
    const oldImage = employee.profileImage;
    if (oldImage) {
      const oldImagePath = path.join(__dirname, "../profileImages", oldImage);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error(`Failed to delete old image: ${err.message}`);
        }
      });
    }
  } else {
    img = employee.profileImage; // Use the existing image if no new file is uploaded
  }

  const updatedData = {
    ...req.body,
    profileImage: img,
  };

  const data = await Employee.findByIdAndUpdate(empId, updatedData, {
    new: true,
  });

  resp.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: data,
  });
};

const update = async (req, resp) => {
  console.log(req.body);
  const {
    name,
    email,
    age,
    address,
    status,
    gender,
    phone,
    hobbies,
    designation,
  } = req.body;
  let image = [];
  // console.log(req.body);
  // Check if new files are uploaded
  // console.log("req.files  ",req.files);
  // console.log("req.body  ",req.body);

  // const profileImages = req.files.profileImages
  // ? req.files.profileImages.map(file => file.filename)
  // : user.profileImages;

  if (req.files.image && req.files.image.length > 0) {
    // Map through the files and extract the filenames
    image = req.files.image.map((file) => file.filename);
  } else {
    // If no new files are uploaded, retain the existing images from the database
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      image = employee.image; // Use the existing images
    }
  }

  // let image = req.body.image;

  // If image is an object (from file upload), extract the path or URL
  // if (req.file) { // If a new file is uploaded, use its path
  //   image = req.file.filename;
  // } else if (typeof image === 'object' && image !== null) { // If `image` is an object, extract the URL or path
  //   image = image.url || image.path;
  // }
  console.log("imageeeee", image);
  const updatedData = {
    ...req.body,
    image: image,
  };
  const data = await Employee.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
  });

  // await data.save();
  console.log(data);
  if (data) {
    resp.status(200).json({
      message: "update successfully",
      data: data,
    });
  } else {
    resp.status(400).json({
      message: "not updated",
      data: data,
    });
  }
};

const remove = async (req, resp) => {
  try {
    // Find the employee by ID
    const data = await Employee.findById(req.params.id);

    if (!data) {
      return resp.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    console.log("dataaaa", data.image);
    // Get the file name of the image
    // const fileNames = data.image; // Assuming image field stores the file name
    const filesName = data.image;
    console.log("filesname" + filesName);
    let deletedFiles = [];
    let errors = [];

    filesName.forEach((filePath) => {
      const fullPath = path.join(__dirname, "../uploads", filePath); // Adjust the folder path as needed
      if (fs.access(fullPath)) {
        try {
          fs.unlinkSync(filePath); // Synchronously delete the file
          deletedFiles.push(filePath); // Track successfully deleted files
        } catch (err) {
          errors.push({ file: filePath, error: err.message });
        }
      } else {
        errors.push({ file: filePath, error: "File not found" });
      }
    });
    // // Build the full path to the file in the uploads folder
    // const filePath = path.join(__dirname, "../uploads", filesName); // Adjust the relative path

    // // Log the file path for debugging
    // console.log("File path:", filePath);

    // // Check if the file exists before attempting to delete it
    // try {
    //   fs.access(filePath); //it ensures file exist
    //   fs.unlink(filePath); //file deleted
    //   console.log("File deleted successfully:", filesName);
    // } catch (fileError) {
    //   console.error("Error deleting file:", fileError);
    //   return resp.status(500).json({
    //     success: false,
    //     message: "Failed to delete file",
    //   });
    // }

    // Delete employee record from the database
    await Employee.findByIdAndDelete(req.params.id);

    return resp.status(200).json({
      success: true,
      message: "Employee and file deleted successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    resp.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const get = async (req, resp) => {
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? req.query.limit : 3;
  let skip = (page - 1) * limit;
  let search = req.query.search || "";
  let query = {};
  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
        { hobbies: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { gender: { $regex: search, $options: "i" } },
      ],
      // { username: { $regex: search, $options: "i" } },
    };
    if (!isNaN(search)) {
      query.$or = [{ age: parseInt(search, 10) }, { phone: parseInt(search) }];
      // query.$or.push({ age: search}); // Add the age search if valid
    }
  }
  const data = await Employee.find(query).skip(skip).limit(limit);
  const total = await Employee.find(query).countDocuments();
  const totalPage = Math.ceil(total / limit);
  console.log("totalpage" + totalPage);
  // console.log("1111111111   ",data.name);

  if (data) {
    // console.log("1111111111   ",data.name);
    resp.status(200).json({
      success: true,
      message: "successfully",
      data: data,
      pageCount: totalPage,
    });
  } else {
    resp.status(400).json({
      message: "data not found",
      data: data,
    });
  }

  // });
};

// const get = async (req, resp) => {
//   try {
//     // Verify the JWT token first
//     // const decoded = await jwt.verify(req.token, SECRET_KEY);

//     // Pagination parameters
//     let page = parseInt(req.query.page) || 1; // Ensure `page` is an integer
//     let limit = parseInt(req.query.limit) || 5; // Ensure `limit` is an integer
//     let skip = (page - 1) * limit; // Calculate the number of documents to skip

//     // Search query
//     let search = req.query.search || "";
//     let query = {};

//     if (search) {
//       // Build the search query
//       query = {
//         $or: [
//           { name: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//           { address: { $regex: search, $options: "i" } },
//           { destination: { $regex: search, $options: "i" } },
//           { hobbies: { $regex: search, $options: "i" } },
//           { status: { $regex: search, $options: "i" } },
//           { gender: { $regex: search, $options: "i" } },
//         ],
//       };

//       // If search is a number, also search by age and phone
//       if (!isNaN(search)) {
//         query.$or.push({ age: parseInt(search, 10) }, { phone: parseInt(search) });
//       }
//     }

//     // Fetch the data and handle pagination
//     const data = await Employee.find(query).skip(skip).limit(limit);
//     const total = await Employee.countDocuments(query); // Use countDocuments to get total records
//     const totalPage = Math.ceil(total / limit); // Calculate total pages

//     if (data && data.length > 0) {
//       resp.status(200).json({
//         success: true,
//         message: "Data fetched successfully",
//         data: data,
//         pageCount: totalPage,
//         currentPage: page,
//       });
//     } else {
//       resp.status(404).json({
//         success: false,
//         message: "No data found",
//       });
//     }
//   } catch (error) {
//     // Handle JWT verification error or other errors
//     resp.status(403).json({
//       success: false,
//       message: "Invalid token or server error",
//       error: error.message,
//     });
//   }
// };

const getOne = async (req, resp) => {
  const data = await Employee.findById(req.params.id);
  // console.log("1111111111   ",data.createdAt);

  if (data) {
    resp.status(200).json({
      success: true,
      message: "successfully",
      data: data,
    });
  } else {
    resp.status(400).json({
      message: "not find",
      data: data,
    });
  }
};
// const forgot = async (req, resp) => {

//   const { email } = req.body;
//   const data = await Employee.findOne({ email: email });
//   if (!data) {
//     return resp.json({
//       success: false,
//       message: "user not exist",
//       data: data,
//     });
//   }
//   var characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
//   var lenString = 50;
//   var token = "";
//   for (var i = 0; i < lenString; i++) {
//     var rnum = Math.floor(Math.random() * characters.length);
//     token += characters.substring(rnum, rnum + 1);
//   }
//   const data1 = await Reset.create({
//     email,
//     token,
//   });
//   data1.save();
//   const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//       user: "tod63@ethereal.email",
//       pass: "fxxS4FbQf8ZUWxPCuz",
//     },
//   });
//   const info = await transporter.sendMail({
//     from: "jaisikadhiman446@gmail.com", // sender address
//     to: req.body.email, // list of receivers
//     subject: "Reset password", // Subject line
//     text: "Hello world?", // plain text body
//     html: `<a href="http://localhost:3000/resetPass/${token}">reset password</a>`, // html body
//   });

//   return resp.status(200).json({
//     success: true,
//     message: "successfully",
//     data: data,
//   });
// };

const forgot = async (req, resp) => {
  const { email } = req.body;
  const data = await Employee.findOne({ email: email });
  if (!data) {
    return resp.json({
      success: false,
      message: "user not exist",
      data: data,
    });
  }
  const token = jwt.sign({ data }, SECRET_KEY);
  const data1 = await Reset.create({
    email,
    token,
  });
  data1.save();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "angelica.kiehn27@ethereal.email",
      pass: "HsJPXS8FpvR1pNemfW",
    },
  });
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  const otpHash = await bcrypt.hash(otp.toString(), 10);

  // Set OTP expiration time (e.g., 10 minutes)
  const otpExpiration = Date.now() + 10 * 60 * 1000;

  await Employee.findByIdAndUpdate(
    data._id, // the ID of the employee document
    { otpHash: otpHash, otpExpiration: otpExpiration }, // only update these fields
    { new: true, runValidators: false } // disable validation to avoid required field issues
  );
  const info = await transporter.sendMail({
    from: "jaisikadhiman446@gmail.com", // sender address
    to: req.body.email, // list of receivers
    subject: "Reset password", // Subject line
    // text: "Hello world?", // plain text body
    text: `Your OTP for password reset is: ${otp}`,
  });

  return resp.status(200).json({
    success: true,
    message: "successfully",
    data: data,
    token: token,
  });
};

const verifyOtp = async (req, resp) => {
  // const{otpHash,otpExpiration}=req.params;
  const user = await Employee.findById(req.params.id);
  console.log(user);
  // const otpHash=localStorage.getItem("otpHash");
  // const otpExpiration=localStorage.getItem("otpExpiration");
  const { otp } = req.body;
  if (!user) {
    return resp.status(400).json({
      success: false,
      message: "user not found",
    });
  }

  if (Date.now > user?.otpExpiration) {
    return resp.status(400).json({
      success: false,
      message: "Otp Expired",
    });
  }
  console.log(typeof otp);
  console.log(typeof user.otpHash);
  const isMatch = await bcrypt.compare(otp.toString(), user.otpHash);
  if (!isMatch) {
    return resp.status(400).json({
      success: false,
      message: "Invalid Otp",
    });
  }
  const token = jwt.sign({ user }, SECRET_KEY, { expiresIn: "15m" });
  return resp
    .status(200)
    .json({ success: true, message: "OTP verified", token: token });
};
// const resetPass = async (req, resp) => {
//   const { token } = req.params;
//   const { password } = req.body;
//   const resetToken = await Reset.findOne({ token: token });
//   console.log("resetttttt",resetToken);

//   if (!resetToken) {
//     resp.json({
//       success: false,
//       message: "token expired",
//     });
//   }
//   const data1 = await Employee.findOne({ email: resetToken.email });
//   // const id = resetToken.id;
//   // console.log(id)
//   const hashedPassword = await bcrypt.hash(password, 3);
//   // const pass=resetToken.password;
//   // const data = await Employee.findByIdAndUpdate(id, {
//   //   password: hashedPassword,
//   // });
//   data1.password = hashedPassword;
//   console.log("hashed",hashedPassword);
//   console.log("data11111",data1.password);
//   await data1.save();
//   if (data1) {
//     return resp.status(200).json({
//       success: true,
//       message: "update Uccessfully",
//     });
//     // await Reset.deleteOne({ token });
//   }
 
// };
const resetPass = async (req, resp) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the reset token in the Reset collection
    const resetToken = await Reset.findOne({ token: token });

    if (!resetToken) {
      return resp.status(400).json({
        success: false,
        message: "Token expired or invalid",
      });
    }

    // Find the user associated with the reset token's email
    const user = await Employee.findOne({ email: resetToken.email });

    if (!user) {
      return resp.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10); // Increased salt rounds to 10 for better security
    user.password = hashedPassword;

    // Save the updated user with the new password
    await user.save();

    // Delete the reset token after successful password reset
    await Reset.deleteOne({ token: token });

    // Return success response
    return resp.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in resetting password:", error);
    return resp.status(500).json({
      success: false,
      message: "An error occurred while resetting the password",
    });
  }
};


module.exports = {
  Register,
  Login,
  update,
  remove,
  get,
  upload,
  getOne,
  forgot,
  resetPass,
  editProfile,
  verifyOtp,
};
