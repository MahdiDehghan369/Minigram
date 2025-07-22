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
      ref: "user",
      required: true,
    },
    post: {
      type: Types.ObjectId,
      ref: "post",
      required: true,
    },
    parent: {
      type: Types.ObjectId,
      ref: "comment",
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = model("comment", commentSchema);
