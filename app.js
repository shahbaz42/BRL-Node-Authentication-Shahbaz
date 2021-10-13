//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config(); // for using env variables
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// we don't neet to require passport-local

const app = express();

//configuring sessions
app.use(session({
    secret: process.env.sessions_Secret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize() ); //initialising passport
app.use(passport.session()); //making express use passport.sessions

app.set("view engine", "ejs");
const DB =
  "mongodb+srv://" +
  process.env.mongo_username +
  ":" +
  process.env.mongo_password +
  "@cluster0.wggru.mongodb.net/users?retryWrites=true&w=majority";
app.use(bodyParser.urlencoded({ extended: true }));

//connecting mongodb atlas
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Sucessful");
  })
  .catch((err) => console.log(err));

// We need to update schema our schema cant be just a js object
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose); // will be used for salting hashing passwords

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser()); //for putting info into cookie
passport.deserializeUser(User.deserializeUser()); //for cracking open cookie to find info

app.get("/", function (req, res) {
  if (req.isAuthenticated()){
    res.render("secrets");  
  } else {
    res.redirect("/login");
  }
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");  
  } else {
    res.redirect("/login");
  }
});

//handling register req made at /register
app.post("/register", function (req, res) {
  User.register({username : req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err)
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })

});

// Handling login request made at /login
app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  })

});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
})

app.listen(8000, function () {
  console.log("Server started at port 8000.");
});

