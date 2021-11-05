const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../util/util");
const { authMiddleware } = require("../util/auth");
const Noti = require("../controller/notification_controller");
const Match = require("../controller/match_controller");

// get notification  by user
router
  .route("/notification")
  .get(authMiddleware, wrapAsync(Noti.getNotification));

// get match post
router
  .route("/match/detail")
  .get(authMiddleware, wrapAsync(Match.getMatchPostDetail));

module.exports = router;
