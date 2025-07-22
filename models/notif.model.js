const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "dislike" ,  "comment", "reply", "follow", "mention"],
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    item: {
      type: Schema.Types.ObjectId,
      required: false, 
      refPath: "itemType",
    },

    itemType: {
      type: String,
      enum: ["post", "comment"],
    },
  },
  { timestamps: true }
);

module.exports = model("notification", notificationSchema);
