const express = require("express");
const router = express.Router();

const auth_controllers = require("../../controllers/auth_controllers");

router.get("/logout", auth_controllers.get_logout);

router.get("/login", auth_controllers.get_login);

router.post("/login", auth_controllers.post_login);

router.get("/register", auth_controllers.get_register);

router.post("/register", auth_controllers.post_register);

router.get("/forgot-password", auth_controllers.get_forgot_password);

router.post("/forgot-password", auth_controllers.post_forgot_password);

router.get("/reset-password/:userId/:token", auth_controllers.get_reset_password);

router.post("/reset-password/:userId/:token", auth_controllers.post_reset_password);

module.exports = router;
