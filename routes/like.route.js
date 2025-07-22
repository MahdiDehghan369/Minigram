const express = require("express");
const router = express.Router();

const authMiddleware = require('./../middlewares/auth');
const checkBlockStatus = require("./../middlewares/checkBlockStatus");
const likeCtrl = require('./../controllers/like.ctrl');

const validateBody = require("./../middlewares/validateBody");
const { likeSchema } = require("./../validators/validator");

router.route("/like").post(authMiddleware, validateBody(likeSchema), checkBlockStatus,  likeCtrl.like);
router
  .route("/dislike")
  .post(authMiddleware, validateBody(likeSchema), checkBlockStatus, likeCtrl.dislike);


module.exports = router;
