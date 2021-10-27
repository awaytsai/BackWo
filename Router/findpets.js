const express = require("express");
const router = express.Router();
const { wrapAsync, uploadFindPets } = require("../util/util");
const { authMiddleware } = require("../util/auth");
const findPets = require("../controller/findpets_controller");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// upload find pets post
router
  .route("/findpets/upload")
  .post(uploadFindPets, authMiddleware, wrapAsync(findPets.uploadFindPetsPost));

// google map markers
router.route("/getFindPetsGeoInfo").get(wrapAsync(findPets.getFindPetsGeoInfo));

// find pets posts
router.route("/getFindPetsPosts").get(wrapAsync(findPets.getFindPetsPosts));

module.exports = router;
