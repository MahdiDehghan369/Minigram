const express = require('express');
const router = express.Router()

const authMiddleware = require('./../middlewares/auth');
const commentCtrl = require('./../controllers/comment.ctrl.js');

router.route("/").post(authMiddleware , commentCtrl.create)
router.route("/:commentId").delete(authMiddleware, commentCtrl.remove).put(authMiddleware , commentCtrl.edit);
router.route("/:commentId/likes").get(authMiddleware, commentCtrl.getCommentLikes);
router
  .route("/:commentId/dislikes")
  .get(authMiddleware, commentCtrl.getCommentDislikes);

module.exports= router