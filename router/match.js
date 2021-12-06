const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../util/util");
const { authMiddleware } = require("../util/auth");
const Noti = require("../controller/notification_controller");
const Match = require("../controller/match_controller");
const mail = require("../controller/mail_controller");

// get notification  by user
router
  .route("/notifications")
  .get(authMiddleware, wrapAsync(Noti.getNotification));

// get notification  by user
router
  .route("/notifications")
  .delete(authMiddleware, wrapAsync(Noti.deleteNotification));

// get match post
router
  .route("/match/detail")
  .get(authMiddleware, wrapAsync(Match.getMatchPostDetail));

// store match list
router
  .route("/matchList")
  .post(authMiddleware, wrapAsync(Match.storeMatchList));

// show confirm post
router
  .route("/confirmPosts")
  .get(authMiddleware, wrapAsync(Match.getConfirmPost));

// update confirm post
router
  .route("/confirmPosts")
  .put(authMiddleware, wrapAsync(Match.updateConfirmPost));

// show successful cases
router.route("/successCases").get(wrapAsync(Match.getSuccessCase));

module.exports = router;
