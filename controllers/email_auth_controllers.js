const User = require("../models/auth/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const mail = require("../services/mail");

exports.get_logout = function (req, res) {
  req.logout();
  res.redirect("/");
};

exports.get_login = function (req, res) {
  res.render("login");
};

exports.post_login = function (req, res) {
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
};

exports.get_register = function (req, res) {
  res.render("register");
};

exports.post_register = function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.render("error", {
          error: "Email already registered.",
          message: err,
        });
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
};

exports.get_forgot_password = function (req, res) {
  res.render("forgotPassword");
};

exports.post_forgot_password = function (req, res) {
  User.findOne({ username: req.body.email }, function (err, found) {
    if (err) {
      console.log(err);
      res.render("error", { error: "Something went wrong. ", message: err });
    } else {
      if (!found) {
        res.render("error", {
          error: "Email not found",
          message: "You must register first.",
        });
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
              res.render("error", {
                error: "Unable to send mail.",
                message: err,
              });
            } else {
              res.render("success", {
                error: "Email sent. ",
                message: "Please check your inbox.",
              });
            }
          }
        );
      }
    }
  });
};

exports.get_reset_password = function (req, res) {
  User.findById(req.params.userId, function (err, found) {
    if (err) {
      res.render("error", { error: "Something went wrong. ", message: err });
    } else {
      if (!found) {
        res.render("error", {
          error: "Record not found. ",
          message: "Try again",
        });
      } else {
        // user is found in our db.
        const secret = process.env.JWT_SECRET + found.id;

        jwt.verify(req.params.token, secret, function (err, decoded) {
          if (err) {
            console.log(err);
            res.render("error", {
              error: "Something went wrong in decoding token ",
              message: err,
            });
          } else {
            if (!decoded) {
              res.render("error", {
                error: "Token could not be verified. ",
                message: err,
              });
            } else {
              res.render("resetPassword");
            }
          }
        });
      }
    }
  });
};

exports.post_reset_password = function (req, res) {
  User.findById(req.params.userId, function (err, found) {
    if (err) {
      res.render("error", { error: "Something went wrong. ", message: err });
    } else {
      if (!found) {
        res.render("error", {
          error: "Record not found. ",
          message: "Try again",
        });
      } else {
        // user is found in our db.
        const secret = process.env.JWT_SECRET + found.id;

        jwt.verify(req.params.token, secret, function (err, decoded) {
          if (err) {
            console.log(err);
            res.render("error", {
              error: "Something went wrong. ",
              message: err,
            });
          } else {
            if (!decoded) {
              res.render("error", {
                error: "Token could not be verified. ",
                message: err,
              });
            } else {
              found.setPassword(req.body.password, function (err, user) {
                if (err) {
                  res.render("error", {
                    error: "Something went wrong. ",
                    message: err,
                  });
                } else {
                  found.save();
                  res.render("success", {
                    error: "Password successfully reset",
                    message: "Log in again",
                  });
                }
              });
            }
          }
        });
      }
    }
  });
};
