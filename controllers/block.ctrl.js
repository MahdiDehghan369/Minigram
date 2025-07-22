const { errorResponse, successResponse } = require("../utils/responses");
const Block = require("./../models/block.model");
const User = require("./../models/user.model");
const Follow = require("./../models/follow.model");
const validatorObjetId = require("./../validators/validatorObjetId");

exports.blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    validatorObjetId(res, "User", userId);

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :(");
    }

    if (userId === req?.user?.id) {
      return errorResponse(res, 400, "You can't block yourself :)");
    }

    const existsBlock = await Block.findOne({
      blocker: req?.user?.id,
      blocked: user._id,
    });

    if (existsBlock) {
      return errorResponse(res, 400, "You have already blocked this user :)");
    }
    await Follow.deleteMany({
      $or: [
        { follower: req.user.id, following: userId },
        { follower: userId, following: req.user.id },
      ],
    });

    await Block.create({
      blocker: req?.user?.id,
      blocked: user._id,
    });

    return successResponse(res, 200, "User blocked successfully :)");
  } catch (error) {
    next(error);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    validatorObjetId(res, "User", userId);

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User not found :|");
    }

    const existsBlock = await Block.findOneAndDelete({
      blocker: req?.user?.id,
      blocked: user._id,
    });

    if (!existsBlock) {
      return errorResponse(res, 400, "You haven't blocked this user :)");
    }

    return successResponse(res, 200, "User unblocked successfully :)");
  } catch (error) {
    next(error);
  }
};

exports.getAllBlockedUser = async (req, res, next) => {
  try {
    const blocker = req?.user?.id;

    const users = await Block.find({ blocker }).populate(
      "blocked",
      "username avatar"
    );

    if (users.length === 0) {
      return successResponse(res, 400, "There is no blocked user :)");
    }

    return successResponse(res, 200, "Fetched successfully :)", {
      users: users.map((item) => item.blocked),
    });
  } catch (error) {
    next(error);
  }
};
