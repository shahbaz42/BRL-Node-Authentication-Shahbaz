//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended : true}));

app.get("/", function(req, res){
    res.send("Monkey");
});

app.listen(8000, function(){
  console.log("Server started at port 8000.");
});