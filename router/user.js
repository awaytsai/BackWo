const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../util/util");
const User = require("../controller/user_controller");
const { authMiddleware } = require("../util/auth");

// sign up
router.route("/member/signup").post(wrapAsync(User.signUp));

// native sign in
router.route("/member/signin").post(wrapAsync(User.signIn));

// facebook sign in
router.route("/member/facebooksignin").post(wrapAsync(User.facebookSignIn));

// render user data
router.route("/userData").get(authMiddleware, wrapAsync(User.getUserData));

module.exports = router;
