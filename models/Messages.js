const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    mediaUrl: {
      type: String,
    },
    mediaType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", messageSchema);

module.exports = Messages;
