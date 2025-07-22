const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "itemType",
  },
  itemType: {
    type: String,
    required: true,
    enum: ["post", "comment"],
  },
  status: {
    type: String,
    enum: ["like", "dislike"],
    default: "like",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

likeSchema.index({ user: 1, item: 1, itemType: 1 }, { unique: true });

module.exports = mongoose.model("like", likeSchema);
