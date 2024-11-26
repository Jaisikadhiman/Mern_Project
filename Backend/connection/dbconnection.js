const mongoose = require("mongoose");
module.exports = dbConnection = () => {
  mongoose
    .connect(process.env.DB_URL, {})
    .then(() => console.log("connected"))
    .catch((error) => console.log("error" + error));
};
// module.exports = dbconnection;
