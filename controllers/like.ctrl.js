const { errorResponse, successResponse } = require("../utils/responses");
const validatorObjetId = require("./../validators/validatorObjetId");
const Like = require("./../models/like.model");

exports.like = async (req, res, next) => {
  try {
    let { item, itemType } = req.body;
    const userId = req?.user?.id;

    itemType = itemType.trim().toLowerCase();
    validatorObjetId(res, itemType, item);

    const existsLike = await Like.findOne({ item, user: userId });

    if (existsLike && existsLike.status === "dislike") {
      await existsLike.deleteOne();
    }

    if (existsLike && existsLike.status === "like") {
      await existsLike.deleteOne();
      return successResponse(res, 200, "Like removed :|");
    }

    const like = await Like.create({
      item,
      itemType,
      user: userId,
      status: "like",
    });

    return successResponse(res, 200, "liked successfully :)");
  } catch (error) {
    next(error);
  }
};

exports.dislike = async (req, res, next) => {
  try {
    let { item, itemType } = req.body;
    const userId = req?.user?.id;

    itemType = itemType.trim().toLowerCase();
    validatorObjetId(res, itemType, item);

    const existsDisLike = await Like.findOne({ item, user: userId });

    if (existsDisLike && existsDisLike.status === "like") {
      await existsDisLike.deleteOne();
    }

    if (existsDisLike && existsDisLike.status === "dislike") {
      await existsDisLike.deleteOne();
      return successResponse(res, 200, "Dislike removed :|");
    }

    const dislike = await Like.create({
      item,
      itemType,
      user: userId,
      status: "dislike",
    });

    return successResponse(res, 200, "Dislike successfully :)");
  } catch (error) {
    next(error);
  }
};

