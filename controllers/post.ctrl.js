const { errorResponse, successResponse } = require("../utils/responses");
const Post = require("./../models/post.model");
const path = require("path");
const fs = require("fs");
const validatorObjetId = require("../validators/validatorObjetId");

exports.create = async (req, res, next) => {
  try {
    const { caption, isPinned = false } = req.body;

    const files = req.files || [];
    const media = [];

    if (files.length === 0) {
      return errorResponse(res, 400, "No file uploaded :(");
    }

    for (const file of files) {
      console.log(file);
      let type = "";
      const extname = path.extname(file.originalname);
      if ([".jpg", ".jpeg", ".png"].includes(extname)) {
        type = "image";
      } else if ([".mp4", ".mkv", ".mov"].includes(extname)) {
        type = "video";
      }

      media.push({
        url: `/uploads/${file.filename}`,
        type,
      });
    }

    const post = await Post.create({
      caption,
      isPinned,
      media,
      author: req?.user?.id,
    });

    return successResponse(res, 200, "Post created with media ✅", post);
  } catch (error) {
    if (req.files.length != 0) {
      for (const file of req.files) {
        fs.unlinkSync(
          path.join(__dirname, "..", "public", "uploads", file.filename)
        );
      }
    }
    next(error);
  }
};

exports.getAPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    validatorObjetId(res, "Post", postId);

    const post = await Post.findOne({ _id: postId, deletedAt: null }).populate(
      "author",
      "name avatar username"
    );

    if (!post) {
      return errorResponse(res, 404, "Post Not Found");
    }

    post.view += 1;

    await post.save();

    return successResponse(res, 200, "Get post successfully :)", post);
  } catch (error) {
    next(error);
  }
};

exports.removePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    validatorObjetId(res, "Post", postId);

    const post = await Post.findOne({ _id: postId, deletedAt: null });

    if (!post) {
      return errorResponse(res, 404, "Post Not Found");
    }

    post.deletedAt = new Date();
    await post.save();

    return successResponse(
      res,
      200,
      "Post moved to trash. You can restore it later :)"
    );
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    validatorObjetId(res, "Post", postId);

    const post = await Post.findOne({ _id: postId, deletedAt: null });

    if (!post) {
      return errorResponse(res, 404, "Post not found :(");
    }

    if (post.author.toString() !== req.user.id) {
      return errorResponse(res, 403, "Unauthorized :(");
    }

    if (req.body.caption) {
      post.caption = req.body.caption;
    }

    if (req.files && req.files.length > 0) {
      post.media.forEach((item) => {
        const filePath = path.join(__dirname, "../public", item.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      const newMedia = req.files.map((file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const type = [".jpg", ".jpeg", ".png"].includes(ext)
          ? "image"
          : "video";
        return {
          url: `/uploads/${file.filename}`,
          type,
        };
      });

      post.media = newMedia;
    }

    await post.save();

    return successResponse(res, 200, "Post updated successfully ✅", post);
  } catch (error) {
    next(error);
  }
};

exports.deletePostMedia = async (req, res, next) => {
  try {
    const { postId, mediaId } = req.params;
    validatorObjetId(res, "Post", postId);

    const post = await Post.findOne({ _id: postId, deletedAt: null });

    if (!post) {
      return errorResponse(res, 404, "Post not found :(");
    }

    if (post.author.toString() !== req.user.id) {
      return errorResponse(res, 403, "Unauthorized :(");
    }

    validatorObjetId(res, "Media", mediaId);

    const media = post.media.filter((item) => item._id == mediaId);
    if (media.length === 0) {
      return errorResponse(res, 404, "Media Not Found :(");
    }

    const mediaPath = path.join(__dirname, "..", "public", media[0].url);
    if (fs.existsSync(mediaPath)) {
      fs.unlinkSync(mediaPath);
    }

    post.media = post.media.filter((item) => item._id != mediaId);

    await post.save();

    return successResponse(res, 200, "Media removed successfully :)");
  } catch (error) {
    next(error);
  }
};

exports.addPostMedia = async (req, res, next) => {
  try {
    const { postId } = req.params;
    validatorObjetId(res, "Post", postId);

    const post = await Post.findOne({ _id: postId, deletedAt: null });

    if (!post) {
      return errorResponse(res, 404, "Post not found :(");
    }

    if (post.author.toString() !== req.user.id) {
      return errorResponse(res, 403, "Unauthorized :(");
    }

    const files = req.files || [];
    const media = post.media;

    if (files.length === 0) {
      return errorResponse(res, 400, "No file uploaded :|");
    }

    for (const file of files) {
      let type = "";
      const extName = path.extname(file.originalname);
      if ([".jpg", ".jpeg", ".png"].includes(extName)) {
        type = "image";
      } else if ([".mp4", ".mkv", ".mov"].includes(extName)) {
        type = "video";
      }

      media.push({
        url: `/uploads/${file.filename}`,
        type,
      });
    }

    post.media = media;

    await post.save();

    return successResponse(res, 200, "Media uploaded successfully :)");
  } catch (error) {
    if (req.files.length != 0) {
      for (const file of req.files) {
        fs.unlinkSync(
          path.join(__dirname, "..", "public", "uploads", file.filename)
        );
      }
    }
    next(error);
  }
};

exports.clearPostMedia = async (req, res, next) => {
  try {
    const { postId } = req.params;
    validatorObjetId(res, "Post", postId);

    const post = await Post.findOne({ _id: postId, deletedAt: null });

    if (!post) {
      return errorResponse(res, 404, "Post not found :(");
    }

    if (post.author.toString() !== req.user.id) {
      return errorResponse(res, 403, "Unauthorized :(");
    }

    const media = post.media;

    if (media.length === 0) {
      return errorResponse(res, 400, "There is no media :|");
    }

    for (const item of media) {
      const mediaPath = path.join(__dirname, "..", "public", item.url);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }

    post.media = [];

    await post.save();

    return successResponse(res, 200, "Clear successfully :)");
  } catch (error) {
    next(error);
  }
};

exports.restorePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    validatorObjetId(res, "Post", postId);

    const post = await Post.findOne({ _id: postId, deletedAt: { $ne: null } });

    if (!post) {
      return errorResponse(res, 404, "Post not found :(");
    }

    if (post.author.toString() !== req.user.id) {
      return errorResponse(res, 403, "Unauthorized :(");
    }

    post.deletedAt = null;
    post.restoredAt = new Date();

    await post.save();

    return successResponse(res, 200, "Post restored successfully :)", post);
  } catch (error) {
    next(error);
  }
};

exports.deletePostPermanently = async (req, res, next) => {
  try {
    const { postId } = req.params;

    validatorObjetId(res, "Post", postId);

    const post = await Post.findById(postId);
    if (!post) return errorResponse(res, 404, "Post not found");

    if (post.author.toString() !== req.user.id) {
      return errorResponse(res, 403, "Unauthorized");
    }

    for (const media of post.media) {
      const filePath = path.join(__dirname, "..", "public", media.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Post.deleteOne({ _id: postId });

    return successResponse(res, 200, "Post permanently deleted");
  } catch (error) {
    next(error);
  }
};

exports.getTrashedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      author: req.user.id,
      deletedAt: { $ne: null },
    }).sort({ deletedAt: -1 });

    return successResponse(
      res,
      200,
      "Trashed posts retrieved successfully",
      posts
    );
  } catch (error) {
    next(error);
  }
};

exports.clearTrash = async (req, res, next) => {
  try {
    const posts = await Post.find({
      author: req.user.id,
      deletedAt: { $ne: null },
    })


    for (let i = 0; i < posts.length; i++) {
      const postMedia = posts[i].media;
      for (let j = 0; j < postMedia.length; j++) {
        const filePath = path.join(__dirname, "..", "public", postMedia[i].url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }


    await Post.deleteMany({ author: req.user.id, deletedAt: { $ne: null } });

    return successResponse(res, 200 , "Trash cleared successfully :)")

  } catch (error) {
    next(error);
  }
};
