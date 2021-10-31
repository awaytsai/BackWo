const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../util/util");
const Auth = require("../util/auth");
const Chat = require("../controller/chatromm_controller");
// get all chat record
router.route("/chat").get();

// post store all record
router
  .route("/chat")
  .get(Auth.authMiddleware, wrapAsync(Chat.getChatroomAccess));

// show existing chatroom record
router.route("/chatroomrecord").get(wrapAsync(Chat.getChatroomRecord));
module.exports = router;
