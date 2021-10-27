const express = require("express");
const router = express.Router();
const { wrapAsync, uploadFindOwners } = require("../util/util");
const findOwners = require("../controller/findowners_controller");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// upload find owners post
router
  .route("/findowners/upload")
  .post(uploadFindOwners, wrapAsync(findOwners.uploadFindOwnersPost));

// google map markers
router
  .route("/getFindOwnersGeoInfo")
  .get(wrapAsync(findOwners.getFindOwnersGeoInfo));

// find owners posts
router
  .route("/getFindOwnersPosts")
  .get(wrapAsync(findOwners.getFindOwnersPosts));

module.exports = router;
