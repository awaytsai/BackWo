const express = require("express");
const router = express.Router();
const { wrapAsync, uploadFindOwners, uploadFindPets } = require("../util/util");
const { authMiddleware, authMiddlewareforChat } = require("../util/auth");
const Pets = require("../controller/pets_controller");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// * findowners //
// upload
router
  .route("/findowners/upload")
  .post(authMiddleware, uploadFindOwners, wrapAsync(Pets.uploadFindPost));

// google map
router.route("/getfindownersGeoInfo").get(wrapAsync(Pets.getPetsGeoInfo));

// posts
router.route("/getfindownersPosts").get(wrapAsync(Pets.getFindPosts));

// detail
router
  .route("/findowners/detail")
  .get(authMiddlewareforChat, wrapAsync(Pets.getFindPostDetail));

// match
router.route("/findowners/match").get(wrapAsync(Pets.getMatchPost));
// .get(authMiddleware, wrapAsync(Pets.getMatchPost));

// * findpets //
// upload
router
  .route("/findpets/upload")
  .post(authMiddleware, uploadFindPets, wrapAsync(Pets.uploadFindPost));

// google map
router.route("/getfindpetsGeoInfo").get(wrapAsync(Pets.getPetsGeoInfo));

// posts
router.route("/getfindpetsPosts").get(wrapAsync(Pets.getFindPosts));

// detail
router
  .route("/findpets/detail")
  .get(authMiddlewareforChat, wrapAsync(Pets.getFindPostDetail));

// match
router.route("/findpets/match").get(wrapAsync(Pets.getMatchPost));
// .get(authMiddleware, wrapAsync(Pets.getMatchPost));

module.exports = router;
