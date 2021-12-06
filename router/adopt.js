const express = require("express");
const router = express.Router();
const adopt = require("../controller/adopt_controller");

router.route("/shelters").get(adopt.getShelters);

// get adopt data
router.route("/adoptData").get(adopt.getAdoptData);

module.exports = router;
