const express = require("express");
const router = express.Router();

const authMiddleware = require('./../middlewares/auth');
const likeCtrl = require('./../controllers/like.ctrl');

const validateBody = require("./../middlewares/validateBody");
const { likeSchema } = require("./../validators/validator");

router.route("/like").post(authMiddleware, validateBody(likeSchema), likeCtrl.like);
router
  .route("/dislike")
  .post(authMiddleware, validateBody(likeSchema), likeCtrl.dislike);


module.exports = router;
