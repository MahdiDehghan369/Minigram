const express = require("express");
const router = express.Router();

const authMiddleware = require("./../middlewares/auth");
const notifCtrl = require("./../controllers/notif.ctrl");

const validateQuery = require('./../middlewares/validateQuery');
const {getNotifSchema} = require('./../validators/validator');

router.route("/").get(authMiddleware , validateQuery(getNotifSchema), notifCtrl.getAllNotifs).delete(authMiddleware, notifCtrl.removeAllNotifs)

router.route("/:notifId").get(authMiddleware , notifCtrl.getNotif).delete(authMiddleware , notifCtrl.removeNotif)

module.exports = router