const { errorResponse, successResponse } = require("../utils/responses");
const validatorObjetId = require("./../validators/validatorObjetId");
const Like = require("./../models/like.model");
const Notif = require("./../models/notif.model");
const Post = require("./../models/post.model");
const Comment = require("./../models/comment.model");

exports.like = async (req, res, next) => {
  try {
    let { item, itemType } = req.body;
    const userId = req?.user?.id;

    itemType = itemType.trim().toLowerCase();
    validatorObjetId(res, itemType, item);

    let foundItem;

    if (itemType === "post") {
      foundItem = await Post.findOne({ _id: item });
    } else if (itemType === "comment") {
      foundItem = await Comment.findOne({ _id: item });
    }

    if (!foundItem) {
      return errorResponse(res, 404, `${itemType} not found :(`);
    }

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

    const existsNotif = await Notif.findOne({
      type: "like",
      item: foundItem._id,
      itemType,
      sender: userId,
      user: foundItem.author,
    });

    if (!existsNotif) {
      await Notif.create({
        user: foundItem.author,
        sender: userId,
        type: "like",
        item: foundItem._id,
        itemType,
      });
    }

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

    let foundItem;

    if (itemType === "post") {
      foundItem = await Post.findOne({ _id: item });
    } else if (itemType === "comment") {
      foundItem = await Comment.findOne({ _id: item });
    }

    if (!foundItem) {
      return errorResponse(res, 404, `${itemType} not found :(`);
    }

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

    const existsNotif = await Notif.findOne({
      type: "dislike",
      item: foundItem._id,
      itemType,
      sender: userId,
      user: foundItem.author,
    });

    if (!existsNotif) {
      await Notif.create({
        user: foundItem.author,
        sender: userId,
        type: "dislike",
        item: foundItem._id,
        itemType,
      });
    }

    return successResponse(res, 200, "Dislike successfully :)");
  } catch (error) {
    next(error);
  }
};