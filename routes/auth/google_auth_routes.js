const express = require("express");
const passport = require("passport");
const google_auth_controllers = require("../../controllers/google_auth_controllers");

const router = express.Router();

router.get(
  "/auth/google",
  google_auth_controllers.passport_google_authenticate
);

router.get(
  "/auth/google/secrets", google_auth_controllers.passport_google_callback
);

module.exports = router;
