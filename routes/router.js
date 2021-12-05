const express = require("express");
const router = express.Router();

const basic_routes = require("./basic/basic_routes");
const email_auth_routes = require("./auth/email_auth_routes");
const google_auth_routes = require("./auth/google_auth_routes");

router.use("/", basic_routes);
router.use("/", email_auth_routes);
router.use("/", google_auth_routes);


module.exports = router;