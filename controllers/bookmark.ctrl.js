const { errorResponse, successResponse } = require("../utils/responses");
const Bookmark = require("./../models/bookmark.model");
const Post = require("./../models/post.model");
const User = require("./../models/user.model");

const validatorObjetId = require("./../validators/validatorObjetId");

exports.toggleBookmark = async (req, res, next) => {
  try {
    let { item } = req.body;
    const userId = req?.user?.id;

    validatorObjetId(res, "Post", item);

    const post = await Post.findOne({ _id: item });

    if (!post) {
      return errorResponse(res, 404, "Post Not Found :)");
    }

    const alreadyExists = await Bookmark.findOne({
      user: userId,
      item,
    });

    if (alreadyExists) {
      await alreadyExists.deleteOne();
      return successResponse(res, 200, "Bookmark deleted :|");
    }

    const bookmark = await Bookmark.create({
      user: userId,
      item,
    });

    return successResponse(
      res,
      200,
      "Post added to bookmark successfully :)",
      bookmark
    );
  } catch (error) {
    next(error);
  }
};

exports.getUserBookmarkPosts = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :)");
    }

    const bookmarks = await Bookmark.find({
      user: user._id,
    }).populate("item").populate("user" , "username avatar");

    return successResponse(
      res,
      200,
      "Bookmarks fetched successfully :)",
      bookmarks
    );
  } catch (error) {
    next(error);
  }
};
