const { errorResponse, successResponse } = require("../utils/responses");
const User = require("./../models/user.model");
const Post = require("./../models/post.model");
const Like = require("./../models/like.model");
const Bookmark = require("./../models/bookmark.model");
const Follow = require("./../models/follow.model");
const fs = require("fs");
const path = require("path");

exports.getUserInfo = async (req, res, next) => {
  try {
    const { username } = req.params;

    const userId = req?.user?.id;

    const user = await User.findOne({ username }).select(
      "username email name bio avatar isPrivate"
    );

    if (!user) {
      return errorResponse(res, 404, "User Not Found :)");
    }

    if (user.isPrivate) {
      return errorResponse(res, 403, "This profile is private. :(");
    }

    const followers = await Follow.find({ following: user._id }).populate(
      "follower",
      "username avatar"
    );
    const followings = await Follow.find({ follower: user._id }).populate(
      "following",
      "username avatar"
    );

    let posts = await Post.find({ author: user._id, deletedAt: null });

    let postsWithStatus = [];

    for (let post of posts) {
      const like = await Like.findOne({
        item: post._id,
        itemType: "post",
        user: userId,
      }).lean();

      const bookmark = await Bookmark.findOne({
        item: post._id,
        user: userId,
      })

      if (like) {
        post = post.toObject();
        post.likeStatus = like.status;
      } else {
        post = post.toObject();
        post.likeStatus = null;
      }

      if (bookmark) {
        post.bookmarkStatus = "save";
      } else {
        post.bookmarkStatus = null;
      }

      postsWithStatus.push(post);
    }

    return successResponse(res, 200, "User profile fetched successfully.", {
      user: {
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
      },
      stats: {
        followersCount: followers.length,
        followingsCount: followings.length,
        postsCount: posts.length,
      },
      followers: followers.map((f) => f.follower),
      followings: followings.map((f) => f.following),
      posts: postsWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

exports.makeProfilePrivate = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { isPrivate: true }
    );

    if (!user) {
      return errorResponse(res, 404, "User Not Found :)");
    }

    return successResponse(res, 200, "Your profile is now private :)");
  } catch (error) {
    next(error);
  }
};

exports.makeProfilePublic = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { isPrivate: false }
    );

    if (!user) {
      return errorResponse(res, 404, "User Not Found :)");
    }

    return successResponse(res, 200, "Your profile is now public :)");
  } catch (error) {
    next(error);
  }
};

exports.changeUsername = async (req, res, next) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    const existsUsername = await User.findOne({
      username,
      _id: { $ne: userId },
    }).lean();

    if (existsUsername) {
      return errorResponse(res, 400, "Username already exists :)");
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :|");
    }

    user.username = username.trim().toLowerCase();
    await user.save();

    return successResponse(res, 200, "Username changed successfully :)", {
      username: user.username,
    });
  } catch (error) {
    next(error);
  }
};

exports.changeEmail = async (req, res, next) => {
  try {
    let { email } = req.body;
    const userId = req.user.id;

    email = email.trim().toLowerCase();

    const existsEmail = await User.findOne({
      email,
      _id: { $ne: userId },
    }).lean();

    if (existsEmail) {
      return errorResponse(res, 400, "Email already exists :)");
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :|");
    }

    user.email = email;
    await user.save();

    return successResponse(res, 200, "Email changed successfully :)", {
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

exports.changeName = async (req, res, next) => {
  try {
    let { name } = req.body;

    const userId = req?.user?.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :)");
    }

    name = name.trim();

    user.name = name;
    await user.save();

    return successResponse(res, 200, "Name changed successfully :)", {
      name: user.name,
    });
  } catch (error) {
    next(error);
  }
};

exports.changeBio = async (req, res, next) => {
  try {
    let { bio } = req.body;
    const userId = req?.user?.id;

    bio = bio.trim();

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :)");
    }

    user.bio = bio;
    await user.save();

    return successResponse(res, 200, "Bio changed successfully :)", {
      bio: user.bio,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadProfile = async (req, res, next) => {
  try {
    const profilePhoto = req?.file;

    if (!profilePhoto) {
      return errorResponse(res, 422, "No file uploaded :|");
    }

    const userId = req?.user?.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", profilePhoto.filename)
      );
      return errorResponse(res, 404, "User Not Found :)");
    }

    if (user.avatar) {
      const oldProfilePath = path.join(__dirname, "..", "public", user.avatar);

      if (fs.existsSync(oldProfilePath)) {
        fs.unlinkSync(oldProfilePath);
      }
    }

    const profileUrl = `/uploads/${profilePhoto.filename}`;

    user.avatar = profileUrl;
    await user.save();

    return successResponse(res, 200, "Profile uploaded successfully :)", {
      avatar: user.avatar,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.file.filename)
      );
    }
    next(error);
  }
};

exports.removeProfile = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :)");
    }

    if (user.avatar) {
      const profilePath = path.join(__dirname, "..", "public", user.avatar);

      if (fs.existsSync(profilePath)) {
        fs.unlinkSync(profilePath);
      }
    }

    user.avatar = null;
    await user.save();

    return successResponse(res, 200, "Profile removed successfully :)");
  } catch (error) {
    next(error);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :)");
    }

    const followers = await Follow.find({
      following: user._id,
    }).populate("follower", "username avatar");

    return successResponse(res, 200, "User followers fetched successfully.", {
      followers: followers.map((f) => f.follower),
    });
  } catch (error) {
    next(error);
  }
};

exports.getFollowings = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return errorResponse(res, 404, "User Not Found :)");
    }

    const followings = await Follow.find({
      followers: user._id,
    }).populate("following", "username avatar");

    return successResponse(res, 200, "User followings fetched successfully.", {
      followings: followings.map((f) => f.follower),
    });
  } catch (error) {
    next(error);
  }
};
