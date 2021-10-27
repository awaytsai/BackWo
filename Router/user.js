const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../util/util");
const User = require("../controller/user_controller");

// sign up
router.route("/member/signin").post(wrapAsync(User.signUp));

// log in
router.route("/member/login").post(wrapAsync());

// log out
router.route("/member/logout").post(wrapAsync());

module.exports = router;
