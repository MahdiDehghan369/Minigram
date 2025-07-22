const { successResponse, errorResponse } = require("../utils/responses");
const Comment = require("./../models/comment.model");
const Post = require("./../models/post.model");
const Like = require("./../models/like.model");
const Notif = require("./../models/notif.model");
const validatorObjetId = require("./../validators/validatorObjetId");

exports.create = async (req, res, next) => {
  try {
    let { content, post, parent = null } = req.body;

    validatorObjetId(res, "Post", post);
    if (parent) {
      validatorObjetId(res, "Comment", parent);
    }

    const postExists = await Post.findById(post);
    if (!postExists) {
      return errorResponse(res, 404, "Post not found");
    }

    let parentComment = null;
    if (parent) {
      parentComment = await Comment.findById(parent);
      if (!parentComment) {
        return errorResponse(res, 404, "Parent comment not found");
      }

      if (
        parentComment.author.toString() !== req.user.id &&
        parentComment.author.toString() !== postExists.author.toString()
      ) {
        const notifReplyExists = await Notif.findOne({
          user: parentComment.author,
          sender: req.user.id,
          item: parentComment._id,
          type: "reply",
        });

        if (!notifReplyExists) {
          await Notif.create({
            user: parentComment.author,
            sender: req.user.id,
            type: "reply",
            item: parentComment._id,
            itemType: "comment",
          });
        }
      }
    }

    const comment = await Comment.create({
      content,
      parent,
      post,
      author: req.user.id,
    });

    if (req.user.id !== postExists.author.toString()) {
      const notifExists = await Notif.findOne({
        user: postExists.author,
        sender: req.user.id,
        item: postExists._id,
        type: "comment",
      });

      if (!notifExists) {
        await Notif.create({
          user: postExists.author,
          sender: req.user.id,
          type: "comment",
          item: postExists._id,
          itemType: "post",
        });
      }
    }

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
