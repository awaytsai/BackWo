const express = require("express");
const router = express.Router();
const { wrapAsync, uploadFindOwners, uploadFindPets } = require("../util/util");
const { authMiddleware, authMiddlewareforChat } = require("../util/auth");
const Pets = require("../controller/pets_controller");
const multer = require("multer");

// upload
router
  .route("/findowners/posts")
  .post(authMiddleware, uploadFindOwners, wrapAsync(Pets.uploadFindPost));

router
  .route("/findpets/posts")
  .post(authMiddleware, uploadFindPets, wrapAsync(Pets.uploadFindPost));

// google map
router.route("/findpostsGeoInfo").get(wrapAsync(Pets.getPetsGeoInfo));

// posts
router.route("/findposts").get(wrapAsync(Pets.getFindPosts));

// detail
router
  .route("/findpost/detail")
  .get(authMiddlewareforChat, wrapAsync(Pets.getFindPostDetail));

// edit post detail
router
  .route("/findpost/editDetail")
  .get(authMiddleware, wrapAsync(Pets.getPostEditDetail));

// update post data
router
  .route("/findowners/posts")
  .put(authMiddleware, multer().none(), wrapAsync(Pets.updatePostdata));
router
  .route("/findpets/posts")
  .put(authMiddleware, multer().none(), wrapAsync(Pets.updatePostdata));

// update post with image
router
  .route("/findowners/imgPosts")
  .put(authMiddleware, uploadFindOwners, wrapAsync(Pets.updatePostdata));

router
  .route("/findpets/imgPosts")
  .put(authMiddleware, uploadFindPets, wrapAsync(Pets.updatePostdata));

// get existing posts
router
  .route("/usersPosts")
  .get(authMiddleware, wrapAsync(Pets.getExistingPostsByUser));

// delete post
router.route("/posts").delete(authMiddleware, wrapAsync(Pets.deletePost));

module.exports = router;
