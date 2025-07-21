const { successResponse, errorResponse } = require("../utils/responses");
const Comment = require("./../models/comment.model");
const Post = require("./../models/post.model");
const Like = require("./../models/like.model");
const validatorObjetId = require("./../validators/validatorObjetId");

exports.create = async (req, res, next) => {
  try {
    let { content, post, parent = null } = req.body;

    validatorObjetId(res, "Post", post);
    if (parent !== null) {
      validatorObjetId(res, "Comment parent", parent);
    }

    const postExists = await Post.findById(post);
    if (!postExists) {
      return errorResponse(res, 404, "Post not found");
    }

    if (parent) {
      const parentExists = await Comment.findById(parent);
      if (!parentExists) {
        return errorResponse(res, 404, "Parent comment not found");
      }
    }

    const comment = await Comment.create({
      content,
      parent,
      post,
      author: req.user.id,
    });

    return successResponse(res, 200, "Comment sent successfully :)", comment);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req?.user?.id;

    validatorObjetId(res, "Comment", commentId);

    const comment = await Comment.findOne({ _id: commentId });

    if (!comment) {
      return errorResponse(res, 404, "Comment not found");
    }

    if (comment.author.toString() !== userId) {
      return errorResponse(res, 403, "You can't remove this comment");
    }

    const commentsToDelete = await Comment.find({
      $or: [{ _id: commentId }, { parent: commentId }],
    }).select("_id");

    const commentIds = commentsToDelete.map((c) => c._id);

    await Comment.deleteMany({ _id: { $in: commentIds } });

    await Like.deleteMany({
      item: { $in: commentIds },
      itemType: "comment",
    });

    return successResponse(
      res,
      200,
      "Comment, replies, and likes removed successfully :)"
    );
  } catch (error) {
    next(error);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req?.user?.id;

    validatorObjetId(res, "Comment", commentId);

    const comment = await Comment.findOne({ _id: commentId });

    if (!comment) {
      return errorResponse(res, 404, "Comment not found");
    }

    if (comment.author.toString() !== userId) {
      return errorResponse(res, 403, "You can't edit this comment ❌");
    }

    comment.content = content;

    await comment.save();

    return successResponse(res, 200, "Comment updated successfully", comment);
  } catch (error) {
    next(error);
  }
};

exports.getCommentLikes = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    validatorObjetId(res, "Comment", commentId);

    const comment = await Comment.findOne({ _id: commentId });

    if (!comment) {
      return errorResponse(res, 404, "Comment not found");
    }

        const likes = await Like.find({ item: comment._id, status: "like" })
          .populate("user", "username avatar")
          .lean();

    return successResponse(res, 200, "Likes fetched :)", {users: likes.map((like)=> like.user)});

  } catch (error) {
    next(error);
  }
};

exports.getCommentDislikes = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    validatorObjetId(res, "Comment", commentId);

    const comment = await Comment.findOne({ _id: commentId });

    if (!comment) {
      return errorResponse(res, 404, "Comment not found");
    }

    const Dislikes = await Like.find({ item: comment._id, status: "dislike" })
      .populate("user", "username avatar")
      .lean();

    return successResponse(res, 200, "Dislikes fetched :)", {
      users: Dislikes.map((dislike) => dislike.user),
    });
  } catch (error) {
    next(error);
  }
};
