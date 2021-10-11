//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const DB ="mongodb+srv://" + process.env.mongo_username + ":" + process.env.mongo_password + "@cluster0.wggru.mongodb.net/users?retryWrites=true&w=majority";
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Sucessful");
  })
  .catch((err) => console.log(err));

app.get("/", function (req, res) {
  res.send("Monkey");
});

app.listen(8000, function () {
  console.log("Server started at port 8000.");
});
