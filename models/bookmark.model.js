const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bookmarkSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Post"
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.index({ user: 1, item: 1, itemType: 1 }, { unique: true });

module.exports = model("Bookmark", bookmarkSchema);
