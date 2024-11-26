const express = require("express");
const cors = require("cors");
const path = require("path");
// import path from "path"
// const { dbConnection } = require("./connection/dbconnection");
const dbConnection = require("./connection/dbconnection.js");
const EmployeeRoutes = require("./Routes/EmployeeRoutes.js");
// const config = require("dotenv")
require('dotenv').config();
const app = express();
// config({path:"./dotenv.env"})
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/documents', express.static(path.join(__dirname, 'documents')));
app.use('/profileImages', express.static(path.join(__dirname, 'profileImages')));

app.get("/", (req, resp) => {
  resp.json({
    message: "hello honey",
  });
});
app.use("/api/employee",EmployeeRoutes)
dbConnection();
const Port = process.env.PORT || 8000;
app.listen(Port, () => {
  console.log(`app is running on port ${Port}`);
});
