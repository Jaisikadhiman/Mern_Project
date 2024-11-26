const jwt = require("jsonwebtoken");
const util = require("util");
const { syncIndexes } = require("mongoose");
const SECRET_KEY = "45uhdfg765dcfvj";
// import { toast } from "react-toastify";
const authentication = async (req, resp, next) => {
  const tokenHeaders = req.headers["authorization"];
  console.log("tokenheaders" + tokenHeaders);
  if (typeof tokenHeaders !== "undefined") {
    const bearer = tokenHeaders.split(" ");
    const token = bearer[1];
    // console.log("tokennnnnnn" + token);
    try {
       jwt.verify(token, SECRET_KEY, (err, auth) => {
        if (err) {
          if (err) {
            return resp.status(401).json({
              code: 401,
              success: false,
              message: err,
            });
          } else {
            return resp.status(403).json({
              code: 403,
              success: false,
              message: "INVALID TOKEN ",
            });
          }
        } else {
          req.auth = auth;
          // console.log("auth",auth)
          next();
        }
      });
    } catch (error) {
      return resp.status(403).json({
        code: 403,
        success: false,
        message: "unauthenticated user",
      });
    }
  } else {
    return resp.redirect("/");
    // return resp.status(403).json({
    //   code: 403,
    //   success: false,
    //   message: "Invalid token",
    // });
  } 
};

const authorization = async (req, resp, next) => {
  console.log("auth", req.auth.data.role);
  const userRole = req.auth.data.role; // Extract user's role from the request object
  // console.log("eeeeeee  "+ userRole )
  if (userRole === "admin" || userRole === "editor") {
    next(); // User is either admin or editor, allow access
  } else {
    return resp.status(403).json({
      code: 403,
      success: false,
      message:
        "Access denied. Only admins or editors can access this resource.",
    });
  }
};
module.exports = { authentication, authorization };
