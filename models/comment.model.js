const { Schema, model, Types } = require("mongoose");

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Types.ObjectId,
      ref: "Post",
      required: true,
    },
    parent: {
      type: Types.ObjectId,
      ref: "Comment",
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = model("Comment", commentSchema);
