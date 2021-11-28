const express = require("express");
const router = express.Router();
const { wrapAsync, uploadFindOwners, uploadFindPets } = require("../util/util");
const { authMiddleware, authMiddlewareforChat } = require("../util/auth");
const Pets = require("../controller/pets_controller");
const multer = require("multer");

// upload
router
  .route("/findowners/upload")
  .post(authMiddleware, uploadFindOwners, wrapAsync(Pets.uploadFindPost));

router
  .route("/findpets/upload")
  .post(authMiddleware, uploadFindPets, wrapAsync(Pets.uploadFindPost));

// google map
router.route("/getFindpostsGeoInfo").get(wrapAsync(Pets.getPetsGeoInfo));

// posts
router.route("/getFindPosts").get(wrapAsync(Pets.getFindPosts));

// detail
router
  .route("/findpost/detail")
  .get(authMiddlewareforChat, wrapAsync(Pets.getFindPostDetail));

// edit post detail
router
  .route("/findpost/edit/detail")
  .get(authMiddleware, wrapAsync(Pets.getPostEditDetail));

// update post data
router
  .route("/findowners/updatePostdata")
  .put(authMiddleware, multer().none(), wrapAsync(Pets.updatePostdata));
router
  .route("/findpets/updatePostdata")
  .put(authMiddleware, multer().none(), wrapAsync(Pets.updatePostdata));

// update post with image
router
  .route("/findowners/updateWithImage")
  .put(authMiddleware, uploadFindOwners, wrapAsync(Pets.updatePostdata));

router
  .route("/findpets/updateWithImage")
  .put(authMiddleware, uploadFindPets, wrapAsync(Pets.updatePostdata));

// get existing posts
router
  .route("/getAllPostsByUser")
  .get(authMiddleware, wrapAsync(Pets.getExistingPostsByUser));

// delete post
router.route("/deletePost").delete(authMiddleware, wrapAsync(Pets.deletePost));

module.exports = router;
