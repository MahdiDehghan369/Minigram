const User = require("./../models/user.model");
const Otp = require("./../models/otp.model");
const bcrypt = require("bcrypt");
const { errorResponse, successResponse } = require("./../utils/responses");
const { accessToken, refreshToken } = require("./../utils/generateToken");
const config = require("../utils/config");
const jwt = require("jsonwebtoken");
const generateId = require("../utils/generateId");
const sendOtpEmail = require("../configs/nodemailer");

exports.register = async (req, res, next) => {
  try {
    const { username, email, name, password } = req.body;

    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      return errorResponse(res, 400, "Username or Email already exists :(");
    }

    const countDocuments = await User.find({}).countDocuments();

    const user = await User.create({
      username,
      email,
      name,
      password,
      role: countDocuments > 0 ? "user" : "admin",
    });

    return successResponse(res, 200, "User registered successfully :)", user);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select(
      "name , username , avatar , email , bio , password"
    );
    if (!user) {
      return errorResponse(res, 422, "Username or Password is wrong :(");
    }
    const matchPassword = bcrypt.compareSync(password, user?.password);
    if (!matchPassword) {
      return errorResponse(res, 422, "Username or Password is wrong :(");
    }

    const acsToken = accessToken(user._id);
    const rfrToken = refreshToken(user._id);

    user.refreshToken = {
      token: rfrToken,
      expiresAt: new Date(
        Date.now() + parseInt(config.auth.refreshTokenExpire) * 1000
      ),
    };

    await user.save();

    res.cookie("refreshToken", rfrToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: parseInt(config.auth.refreshTokenExpire) * 1000,
    });

    return successResponse(res, 200, "Login successfully :)", {
      accessToken: acsToken,
      user: {
        Id: user?.id,
        username: user?.username,
        email: user?.email,
        avatar: user?.avatar,
        bio: user?.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return errorResponse(res, 400, "Refresh token missing");
    }

    const user = await User.findOne({
      "refreshToken.token": refreshToken,
    });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Strict",
    });

    return successResponse(res, 200, "User logged out successfully");
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
      return errorResponse(res, 400, "Refresh token missing");
    }

    const user = await User.findOne({
      "refreshToken.token": refreshTokenCookie,
    });

    if (!user) {
      return errorResponse(
        res,
        403,
        "Invalid refresh token or user not found ⛔"
      );
    }

    if (user.refreshToken.expiresAt < new Date()) {
      return errorResponse(res, 409, "Refresh token has expired 🕒");
    }

    const decoded = jwt.verify(refreshTokenCookie, config.auth.secretKey);

    if (user._id.toString() !== decoded.id) {
      return errorResponse(
        res,
        404,
        "Refresh token is invalid or user mismatch 🚫"
      );
    }

    const acsToken = accessToken(user._id);
    const rfrToken = refreshToken(user._id);

    res.cookie("refreshToken", rfrToken, {
      httpOnly: true,
      maxAge: parseInt(config.auth.refreshTokenExpire) * 1000,
      sameSite: "Strict",
    });

    user.refreshToken = {
      token: rfrToken,
      expiresAt: new Date(
        Date.now() + parseInt(config.auth.refreshTokenExpire) * 1000
      ),
    };

    await user.save();
    return successResponse(res, 200, "Successfully :)", {
      accessToken: acsToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).select(
      "name username email avatar bio"
    );

    if (!user) {
      return successResponse(res, 404 , "User Not Found :(") 
    }

    return successResponse(res, 200, "successfully :)", { user });
  } catch (error) {
    next(error);
  }
};

exports.sendResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(
        res,
        400,
        "If this email is registered, an OTP has been sent."
      );
    }

    const otpCode = generateId();

    const sendOtp = await sendOtpEmail(email, otpCode);

    Otp.create({
      code: otpCode,
      email,
      used: false,
      expireAt: new Date(Date.now() + 300 * 1000),
    });

    return successResponse(
      res,
      200,
      "If this email is registered, an OTP has been sent."
    );
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    const otp = await Otp.findOne({ email, code: otpCode, used: false });

    if (!otp) {
      return errorResponse(res, 400, "Invalid OTP ❌");
    }

    if (otp.expireAt < new Date()) {
      return errorResponse(res, 400, "OTP has expired ❌");
    }

    const resetToken = jwt.sign({ email }, config.auth.secretKey, {
      expiresIn: "300s",
    });

    res.cookie("resetToken", resetToken, {
      httpOnly: true,
      maxAge: 300 * 1000,
      sameSite: "Strict",
    });

    otp.used = true;

    await otp.save();

    return successResponse(res, 200, "OTP verified successfully ✅");
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { resetToken } = req?.cookies;

    if (!resetToken) {
      return errorResponse(res, 400, "Reset Token missing");
    }

    const decoded = await jwt.verify(resetToken, config.auth.secretKey);

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return errorResponse(res, 404, "User Not Found");
    }

    user.password = password;

    await user.save();

    res.clearCookie("resetToken", {
      httpOnly: true,
      sameSite: "Strict",
    });

    return successResponse(res, 200, "Password changed successfully :)");
  } catch (error) {
    next(error);
  }
};
