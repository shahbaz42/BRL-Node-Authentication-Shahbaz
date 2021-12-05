//jshint esversion:6
require("dotenv").config(); // for using env variables
require("./models/model"); 

const express = require("express");
const session = require("express-session");
const passport = require("passport");

const ejs = require("ejs");

const Router = require("./routes/router");


const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.sessions_Secret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize()); //initialising passport
app.use(passport.session()); //making express use passport.sessions

app.set("view engine", "ejs");
app.use("/", Router);

app.listen(8000, function () {
  console.log("Server started at port 8000.");
});
