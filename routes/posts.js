const express = require("express");
const router = express.Router();
const passport = require("passport");
const authenticateMiddleWare = require("../middleware/authentication");

const post_controller = require("../controllers/post-controller");

router.get("/", post_controller.allPostsGet);
router.get("/category/:categoryName", post_controller.categoriesPostsGet);
router.get("/editors-pick", post_controller.editorsPicksGet);
router.get("/featured", post_controller.featuredPostsGet);
router.get("/recentposts", post_controller.RecentPostsGet);
router.get("/search", post_controller.searchPostsGet);
router.get("/trending", post_controller.trendingPostsGet);
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  post_controller.postGet
);

// Route to update likes
router.patch(
  "/:id/like",
  passport.authenticate("jwt", { session: false }),
  post_controller.likesUpdatesPatch
);
router.patch(
  "/:id/unlike",
  passport.authenticate("jwt", { session: false }),
  post_controller.unLikeUpdatesPatch
);
//Route to Create and Delete posts only available to posts authors (i.e Writers/Authors frontend)
//Change the authentication middleware to check for Writers instead.

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  authenticateMiddleWare.authenticateUserAndVerifyRole,
  post_controller.createPostPost
);
router.get(
  "/:id/update",
  passport.authenticate("jwt", { session: false }),
  authenticateMiddleWare.authenticateUserAndVerifyRole,
  post_controller.updatePostget
);
router.post(
  "/:id/update",
  passport.authenticate("jwt", { session: false }),
  authenticateMiddleWare.authenticateUserAndVerifyRole,
  post_controller.updatePostPost
);
router.delete(
  "/:id/delete",
  passport.authenticate("jwt", { session: false }),
  authenticateMiddleWare.authenticateUserAndVerifyRole,
  post_controller.deletePostDelete
);
router.patch(
  "/:id/publish",
  passport.authenticate("jwt", { session: false }),
  authenticateMiddleWare.authenticateUserAndVerifyRole,
  post_controller.publishPostPatch
);
router.patch(
  "/:id/unpublish",
  passport.authenticate("jwt", { session: false }),
  authenticateMiddleWare.authenticateUserAndVerifyRole,
  post_controller.unPublishPostPatch
);

//Route to get all posts by a particular author, Going to be used on both readers frontend and Writers frontend.
router.get(
  "/author/:authorId",
  passport.authenticate("jwt", { session: false }),
  post_controller.allAuthorsPostsGet
);

module.exports = router;
