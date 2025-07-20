const express = require('express');
const router = express.Router()

const authMiddleware = require('./../middlewares/auth');
const validateBody = require('./../middlewares/validateBody');
const userCtrl = require('./../controllers/user.ctrl');
const {usernameSchema , emailSchema , nameSchema , bioSchema} = require('./../validators/validator');

const uploader = require('./../configs/multer');

router.route("/private").patch(authMiddleware , userCtrl.makeProfilePrivate)
router.route("/public").patch(authMiddleware , userCtrl.makeProfilePublic)

router.route("/:username").get(authMiddleware,  userCtrl.getUserInfo)

router
  .route("/setting/username")
  .patch(authMiddleware, validateBody(usernameSchema) ,userCtrl.changeUsername);
router.route("/setting/email").patch(authMiddleware,validateBody(emailSchema), userCtrl.changeEmail);
router.route("/setting/name").patch(authMiddleware, validateBody(nameSchema), userCtrl.changeName);
router
  .route("/setting/bio")
  .patch(authMiddleware, validateBody(bioSchema), userCtrl.changeBio);

router.route("/setting/profile").post(authMiddleware, uploader.single("profile") , userCtrl.uploadProfile).delete(authMiddleware , userCtrl.removeProfile);

router.route("/:username/followers").get(authMiddleware , userCtrl.getFollowers)
router.route("/:username/followings").get(authMiddleware , userCtrl.getFollowings)
module.exports = router