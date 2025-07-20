const express = require('express');
const router = express.Router()

const authCtrl = require('./../controllers/auth.ctrl');

const validateBody = require('../middlewares/validateBody');
const {registerSchema , loginSchema , emailSchema , passwordSchema} = require('../validators/validator');

const authMiddleware = require('./../middlewares/auth');

router
  .route("/register")
  .post(validateBody(registerSchema), authCtrl.register);

router.route("/login").post(validateBody(loginSchema) ,authCtrl.login)

router.route("/logout").post(authCtrl.logout);

router.route("/refresh-token").post(authCtrl.refreshToken)

router.route("/me").get(authMiddleware , authCtrl.getMe)

router.route("/send-reset-otp").post(validateBody(emailSchema) ,authCtrl.sendResetOtp);

router.route("/verify-otp").post(validateBody(emailSchema), authCtrl.verifyOtp)

router
  .route("/change-password")
  .post(validateBody(passwordSchema), authCtrl.changePassword);

module.exports = router