//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
require("dotenv").config(); // for using env variables
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const mail = require("./mail");
const User = require("./model");

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");

//configuring sessions
app.use(
  session({
    secret: process.env.sessions_Secret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize()); //initialising passport
app.use(passport.session()); //making express use passport.sessions
app.use(express.urlencoded({ extended: true }));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      // console.log(profile);
      User.findOrCreate(
        {
          googleId: profile.id,
          username: profile.id,
          name: profile.displayName,
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

passport.use(User.createStrategy());

//Below code is for putting info into cookie and for cracking open cookie to find info
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//root route

app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets", { userSecret: req.user.secret });
  } else {
    User.find({ secret: { $ne: null } }, function (err, foundUsers) {
      if (err) {
        console.log(err);
        res.render("error", { error: "Something went wrong", message: err });
      } else {
        if (foundUsers) {
          res.render("home", { usersWithSecrets: foundUsers });
        }
      }
    });
  }
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

// routes for handling secret submition when user is authenticated

app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user.id, function (err, found) {
      if (err) {
        console.log(err);
        res.render("error", { error: "Something went wrong", message: err });
      } else {
        if (found) {
          found.secret = req.body.secret;
          found.save(function () {
            res.redirect("/secrets");
          });
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets", { userSecret: req.user.secret });
  } else {
    res.redirect("/");
  }
});

// routes for local register / login

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.render("error", { error: "Email already registered.", message: err });
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

// Routes for password reset

app.get("/forgot-password", function (req, res) {
  res.render("forgotPassword");
});

app.post("/forgot-password", function (req, res) {
  User.findOne({ username: req.body.email }, function (err, found) {
    if (err) {
      console.log(err);
      res.render("error", { error: "Something went wrong. ", message: err });
    } else {
      if (!found) {
        res.render("error", { error: "Email not found", message: "You must register first." });
      } else {
        // When Email is present in our DB
        const secret = process.env.JWT_SECRET + found.id;
        const payload = {
          id: found._id,
          email: found.username,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "15m" });
        const link =
          "http://localhost:8000/reset-password/" + found._id + "/" + token;

        const html =
          '<H1>Reset your password by clicking the link below: </h1></br><a heref="' +
          link +
          '">' +
          link +
          "</a>";
        const subject = "Reset Password";
        const body = "Reset your password.";

        mail.sendMail(
          found.username,
          subject,
          body,
          html,
          function (err, result) {
            if (err) {
              res.render("error", { error: "Unable to send mail.", message: err });
            } else {
              res.render("success", { error: "Email sent. ", message: "Please check your inbox." });
            }
          }
        );
      }
    }
  });
});

app.get("/reset-password/:userId/:token", function (req, res) {
  User.findById(req.params.userId, function (err, found) {
    if (err) {
      res.render("error", { error: "Something went wrong. ", message: err });
    } else {
      if (!found) {
        res.render("error", { error: "Record not found. ", message: "Try again" });
      } else {
        // user is found in our db.
        const secret = process.env.JWT_SECRET + found.id;

        jwt.verify(req.params.token, secret, function (err, decoded) {
          if (err) {
            console.log(err);
            res.render("error", { error: "Something went wrong in decoding token ", message: err });
          } else {
            if (!decoded) {
              res.render("error", { error: "Token could not be verified. ", message: err });
            } else {
              res.render("resetPassword");
            }
          }
        });
      }
    }
  });
});

app.post("/reset-password/:userId/:token", function (req, res) {
  User.findById(req.params.userId, function (err, found) {
    if (err) {
      res.render("error", { error: "Something went wrong. ", message: err });
    } else {
      if (!found) {
        res.render("error", { error: "Record not found. ", message: "Try again" });
      } else {
        // user is found in our db.
        const secret = process.env.JWT_SECRET + found.id;

        jwt.verify(req.params.token, secret, function (err, decoded) {
          if (err) {
            console.log(err);
            res.render("error", { error: "Something went wrong. ", message: err });
          } else {
            if (!decoded) {
              res.render("error", { error: "Token could not be verified. ", message: err });
            } else {
              found.setPassword(req.body.password, function (err, user) {
                if (err) {
                  res.render("error", { error: "Something went wrong. ", message: err });
                } else {
                  found.save();
                  res.render("success", { error: "Password successfully reset", message: "Log in again" });
                }
              });
            }
          }
        });
      }
    }
  });
});

//Routes for google login

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

//Logout

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(8000, function () {
  console.log("Server started at port 8000.");
});
