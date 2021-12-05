require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./auth/user");

const DB =
//   "mongodb+srv://" +
//     process.env.mongo_username +
//     ":" +
//     process.env.mongo_password +
//     "@cluster0.wggru.mongodb.net/users?retryWrites=true&w=majority" ||
  "mongodb://localhost:27017/secrets";

//connecting with db
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Sucessful");
  })
  .catch((err) => console.log(err));

module.exports = User;
