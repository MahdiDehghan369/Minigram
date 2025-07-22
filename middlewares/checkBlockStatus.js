const Block = require("./../models/block.model");
const Comment = require("./../models/comment.model");
const Post = require("./../models/post.model");
const User = require("./../models/user.model");
const { errorResponse } = require("../utils/responses");
const validatorObjetId = require("./../validators/validatorObjetId");

const checkBlocked = async (reqUserId, targetUserId) => {
  if (!reqUserId || !targetUserId) return false;

  const existsBlock = await Block.findOne({
    $or: [
      { blocker: reqUserId, blocked: targetUserId },
      { blocker: targetUserId, blocked: reqUserId },
    ],
  });

  return !!existsBlock;
};

const checkBlockStatus = async (req, res, next) => {
  try {
    const currentUserId = req?.user?.id;
    let { userId, username, postId } = req.params;

    if (userId) {
      const isBlocked = await checkBlocked(currentUserId, userId);
      if (isBlocked)
        return errorResponse(res, 403, "You can't interact with this user :(");
      return next();
    }

    if (username) {
      username = username.trim().toLowerCase();

      const user = await User.findOne({ username });
      const isBlocked = await checkBlocked(currentUserId, user?._id);
      if (isBlocked)
        return errorResponse(res, 403, "You can't interact with this user :(");
      return next();
    }

    if (postId) {
      const post = await Post.findOne({ _id: postId });
      const isBlocked = await checkBlocked(currentUserId, post.author);
      if (isBlocked)
        return errorResponse(res, 403, "You can't interact with this user :(");
      return next();
    }

    const {
      item = null,
      itemType = null,
      post = null,
      parent = null,
    } = req?.body;

    if (item && itemType) {
      validatorObjetId(res, itemType, item);

      const Model =
        itemType === "comment" ? Comment : itemType === "post" ? Post : null;
      if (!Model) return errorResponse(res, 400, "Invalid item type");

      const foundItem = await Model.findById(item).lean();
      if (!foundItem) return errorResponse(res, 404, `${itemType} not found`);

      const isBlocked = await checkBlocked(currentUserId, foundItem.author);
      if (isBlocked)
        return errorResponse(res, 403, "You can't interact with this user :(");
      return next();
    }

    if (parent) {
      validatorObjetId(res, "Comment", parent);

      const foundComment = await Comment.findById(parent).lean();
      if (!foundComment)
        return errorResponse(res, 404, "Parent comment not found");

      const isBlocked = await checkBlocked(currentUserId, foundComment.author);
      if (isBlocked)
        return errorResponse(res, 403, "You can't interact with this user :(");
      return next();
    }

    if (post) {
      validatorObjetId(res, "Post", post);

      const foundPost = await Post.findById(post).lean();
      if (!foundPost) return errorResponse(res, 404, "Post not found");

      const isBlocked = await checkBlocked(currentUserId, foundPost.author);
      if (isBlocked)
        return errorResponse(res, 403, "You can't interact with this user :(");
      return next();
    }

    return next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkBlockStatus;
