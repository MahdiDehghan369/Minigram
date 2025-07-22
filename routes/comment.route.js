const express = require('express');
const router = express.Router()

const authMiddleware = require('./../middlewares/auth');
const commentCtrl = require('./../controllers/comment.ctrl.js');

const validateBody = require("./../middlewares/validateBody");
const { commentSchema } = require("./../validators/validator");

router.route("/").post(authMiddleware, validateBody(commentSchema) ,commentCtrl.create);
router.route("/:commentId").delete(authMiddleware, commentCtrl.remove).put(authMiddleware , validateBody(commentSchema), commentCtrl.edit);
router.route("/:commentId/likes").get(authMiddleware, commentCtrl.getCommentLikes);
router
  .route("/:commentId/dislikes")
  .get(authMiddleware, commentCtrl.getCommentDislikes);

module.exports= router