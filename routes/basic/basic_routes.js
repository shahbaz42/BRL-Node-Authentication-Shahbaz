const express = require("express");
const basic_controller = require("../../controllers/basic_controllers");

const router = express.Router();

router.get("/", basic_controller.root);

router.get("/submit", basic_controller.get_submit);

router.post("/submit", basic_controller.post_submit);

router.get("/secrets", basic_controller.get_secrets);

module.exports = router;
