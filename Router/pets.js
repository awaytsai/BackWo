const express = require("express");
const router = express.Router();
const { wrapAsync, uploadFindOwners, uploadFindPets } = require("../util/util");
const { authMiddleware, authMiddlewareforChat } = require("../util/auth");
const Pets = require("../controller/pets_controller");
const multer = require("multer");

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

// get edit detail
router
  .route("/findowners/edit/detail")
  .get(authMiddleware, wrapAsync(Pets.getPostEditDetail));

// update post data
router
  .route("/findowners/updatePostdata")
  .put(authMiddleware, multer().none(), wrapAsync(Pets.updatePostdata));

// update post data with image
router
  .route("/findowners/updateWithImage")
  .put(authMiddleware, uploadFindOwners, wrapAsync(Pets.updatePostdata));

///////////////////////////////////////////////////////////////////////

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

// get edit detail
router
  .route("/findpets/edit/detail")
  .get(authMiddleware, wrapAsync(Pets.getPostEditDetail));

// update post data
router
  .route("/findpets/updatePostdata")
  .put(authMiddleware, multer().none(), wrapAsync(Pets.updatePostdata));

// update post data with image
router
  .route("/findpets/updateWithImage")
  .put(authMiddleware, uploadFindPets, wrapAsync(Pets.updatePostdata));

// *all //
// get existing posts
router
  .route("/getAllPostsByUser")
  .get(authMiddleware, wrapAsync(Pets.getExistingPostsByUser));

router.route("/deletePost").delete(authMiddleware, wrapAsync(Pets.deletePost));

module.exports = router;
