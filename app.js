//jshint esversion:6
const express = require("express");
const ejs = require("ejs")
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();  // for using env variables 

const app = express();
app.set("view engine", "ejs")
const DB ="mongodb+srv://" + process.env.mongo_username + ":" + process.env.mongo_password + "@cluster0.wggru.mongodb.net/users?retryWrites=true&w=majority";
app.use(bodyParser.urlencoded({ extended: true }));

//connecting mongodb atlas
mongoose.connect(DB).then(() => {
    console.log("Connection Sucessful");
}).catch((err) => console.log(err));

const userSchema = {
    email : String,
    password : String
}

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.send("Monkey");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

//handling register req made at /register
app.post("/register", function(req, res){
    const newUser = new User({
        email : req.body.username,
        password : req.body.password
    })

    newUser.save(function(err){
        if(err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    })  
});

// Handling login request made at /login
app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    //finding username in database
    User.findOne({email: username}, function(err, result){
        if(err){                       // Not finding any records isn't an error condition, we need to handle that separately in else
            console.log(err);
        } if (result){
            if(result.password === password){
                res.render("secrets");
            } else{
                res.send("incorrect Password")
            }
        } else{                       
            res.send("Email Not Found")
        }
    });

});



app.listen(8000, function () {
  console.log("Server started at port 8000.");
});
