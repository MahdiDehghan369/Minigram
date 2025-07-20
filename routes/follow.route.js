const express = require('express');
const router = express.Router()

const followCtrl = require('./../controllers/follow.ctrl');


const authMiddleware = require('./../middlewares/auth');

router.route("/:userId/follow").post(authMiddleware, followCtrl.follow);
router.route("/:userId/unfollow").delete(authMiddleware, followCtrl.unfollow);

module.exports = router