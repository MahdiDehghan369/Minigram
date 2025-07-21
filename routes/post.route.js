const express = require("express");
const router = express.Router();

const postCtrl = require("./../controllers/post.ctrl");
const authMiddleware = require("./../middlewares/auth");

const upload = require('./../configs/multer');

const {postSchema} = require('./../validators/validator');
const validateBody = require('./../middlewares/validateBody');


router
  .route("/")
  .post(
    authMiddleware,
    // validateBody(postSchema),
      upload.array("media", 10),
    postCtrl.create
  );

router.route("/trash").get(authMiddleware, postCtrl.getTrashedPosts);
router.route("/clear-trash").delete(authMiddleware, postCtrl.clearTrash);


router
  .route("/:postId")
  .get(authMiddleware, postCtrl.getAPost)
  .delete(authMiddleware, postCtrl.removePost)
  .put(authMiddleware, postCtrl.updatePost);

router
  .route("/:postId/media")
  .post(authMiddleware, upload.array("media", 10), postCtrl.addPostMedia);

router.route("/:postId/media/:mediaId").delete(authMiddleware , postCtrl.deletePostMedia)

router.route("/:postId/clear-media").delete(authMiddleware, postCtrl.clearPostMedia);

router.route("/:postId/restore").patch(authMiddleware, postCtrl.restorePost);

router
  .route("/:postId/permanent")
  .delete(authMiddleware, postCtrl.deletePostPermanently);

router.route("/:postId/likes").get(authMiddleware , postCtrl.getLikes)
router.route("/:postId/dislikes").get(authMiddleware , postCtrl.getDislikes)

router.route("/:postId/comments").get(authMiddleware , postCtrl.getComments)

module.exports = router;
