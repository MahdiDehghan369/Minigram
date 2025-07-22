const express = require("express");
const router = express.Router();

const followCtrl = require("./../controllers/follow.ctrl");

const checkBlockStatus = require("./../middlewares/checkBlockStatus");
const authMiddleware = require("./../middlewares/auth");

router
  .route("/:userId/follow")
  .post(authMiddleware, checkBlockStatus, followCtrl.follow);
router
  .route("/:userId/unfollow")
  .delete(authMiddleware, checkBlockStatus, followCtrl.unfollow);

module.exports = router;
