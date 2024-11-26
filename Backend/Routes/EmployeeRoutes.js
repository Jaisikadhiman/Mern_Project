const express = require("express");
const { authentication,authorization} = require("../Middleware/auth.js");
// const { auth } = require("../Middleware/auth");

const {
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
} = require("../Controller/Employee_api.js");

const router = express.Router();
router.post("/register", upload, Register);
router.get("/login", Login);
router.post("/update/:id", upload, update);
router.post("/editProfile", upload, editProfile);
router.post("/verifyOtp/:id", verifyOtp);

router.post("/delete/:id", remove);
router.get("/get", authentication,authorization, get);
router.get("/getOne/:id", getOne);
router.post("/forgot", forgot);
router.post("/resetPass/:token", resetPass);
module.exports = router;
