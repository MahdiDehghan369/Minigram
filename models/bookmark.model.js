const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bookmarkSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "post"
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

module.exports = model("bookmark", bookmarkSchema);
