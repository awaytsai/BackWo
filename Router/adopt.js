const express = require("express");
const router = express.Router();
const adopt = require("../controller/adopt_controller");
// const mail = require("../controller/mail_controller");

router.route("/getShelters").get(adopt.getShelters);

// get adopt data
router.route("/getAdoptData").get(adopt.getAdoptData);

// get adopt data
// router.route("/mail").get(mail.getmail);
// router.route("/matchmail").get(mail.getMatchmail);

module.exports = router;
