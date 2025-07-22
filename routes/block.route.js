const express = require("express");
const router = express.Router();

const authMiddleware = require("./../middlewares/auth");
const blockCtrl = require("./../controllers/block.ctrl");

router.route("/:userId").post(authMiddleware , blockCtrl.blockUser)
router.route("/:userId/unblock").delete(authMiddleware , blockCtrl.unblockUser)
router.route("/").get(authMiddleware , blockCtrl.getAllBlockedUser)

module.exports = router