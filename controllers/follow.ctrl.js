const Follow = require("./../models/follow.model");
const User = require("./../models/user.model");
const Notif = require("./../models/notif.model");

const validatorObjectId = require("./../validators/validatorObjetId");
const { errorResponse, successResponse } = require("./../utils/responses");

exports.follow = async (req, res, next) => {
  try {
    const { userId } = req.params;

    validatorObjectId(res, "User", userId);

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :(");
    }

    if (user?._id.toString() === req.user.id) {
      return errorResponse(res, 400, "You can not follow yourself :(");
    }

    const existsFollow = await Follow.findOne({
      follower: req.user.id,
      following: userId,
    });

    if (existsFollow) {
      return errorResponse(res, 409, "You already follow this user :)");
    }

    await Follow.create({
      follower: req.user?.id,
      following: userId,
    });

    await Notif.create({
      user: user._id,
      sender: req.user.id,
      type: "follow"
    })

    return successResponse(res, 200, "Follow successfully :)");
  } catch (error) {
    next(error);
  }
};

exports.unfollow = async (req, res, next) => {
  try {
    const { userId } = req.params;

    validatorObjectId(res, "User", userId);

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :(");
    }

    const deletedFollow = await Follow.findOneAndDelete({
      follower: req.user.id,
      following: userId,
    });

    if (!deletedFollow) {
      return errorResponse(res, 409, "You are not following this user");
    } 

    successResponse(res, 200, "Unfollowed successfully :)");

  } catch (error) {
    next(error);
  }
};
