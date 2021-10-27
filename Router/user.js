const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../util/util");
const User = require("../controller/user_controller");

// sign up
router.route("/member/signup").post(wrapAsync(User.signUp));

// native sign in
router.route("/member/signin").post(wrapAsync(User.signIn));

// fb sign in
// router.route("/member/fbsignin").post(wrapAsync(User.fbsignIn));

// log out
router.route("/member/logout").post(wrapAsync());

module.exports = router;
