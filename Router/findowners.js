const express = require("express");
const router = express.Router();
const { wrapAsync, uploadFindOwners, uploadFindPets } = require("../util/util");
const { authMiddleware, authMiddlewareforChat } = require("../util/auth");
const findOwners = require("../controller/findowners_controller");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// * findowners //
// upload find owners post
router
  .route("/findowners/upload")
  .post(
    authMiddleware,
    uploadFindOwners,
    wrapAsync(findOwners.uploadFindOwnersPost)
  );

// google map markers
router
  .route("/getfindownersGeoInfo")
  .get(wrapAsync(findOwners.getFindOwnersGeoInfo));

// find owners posts
router
  .route("/getfindownersPosts")
  .get(wrapAsync(findOwners.getFindOwnersPosts));

// find owners posts detail
router
  .route("/findowners/detail")
  .get(authMiddlewareforChat, wrapAsync(findOwners.getFindOwnersDetail));

// * findpets //
// upload find pets post
router
  .route("/findpets/upload")
  .post(
    authMiddleware,
    uploadFindPets,
    wrapAsync(findOwners.uploadFindOwnersPost)
  );

// google map markers
router
  .route("/getfindpetsGeoInfo")
  .get(wrapAsync(findOwners.getFindOwnersGeoInfo));

// find pets posts
router.route("/getfindpetsPosts").get(wrapAsync(findOwners.getFindOwnersPosts));

// find owners posts detail
router
  .route("/findpets/detail")
  .get(authMiddlewareforChat, wrapAsync(findOwners.getFindOwnersDetail));

module.exports = router;
