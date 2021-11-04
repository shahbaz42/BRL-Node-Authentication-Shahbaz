const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
require("dotenv").config(); // for using env variables

// const DB =
//   "mongodb+srv://" +
//   process.env.mongo_username +
//   ":" +
//   process.env.mongo_password +
//   "@cluster0.wggru.mongodb.net/users?retryWrites=true&w=majority";

const DB = "mongodb://localhost:27017/secrets";

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Sucessful");
  })
  .catch((err) => console.log(err));

// We need to update schema our schema cant be just a js object
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  googleId: String,
  secret: String,
});

userSchema.plugin(passportLocalMongoose); // will be used for salting hashing passwords
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

module.exports = User;
