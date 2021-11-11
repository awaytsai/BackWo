const express = require("express");
const router = express.Router();
const adopt = require("../controller/adopt_controller");

// fetch adopt data
router.route("/fetchAdoptData").get(adopt.fetchAdoptData);

router.route("/getShelters").get(adopt.getShelters);

// get adopt data
router.route("/getAdoptData").get(adopt.getAdoptData);

module.exports = router;
