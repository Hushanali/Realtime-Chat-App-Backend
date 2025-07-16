const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const Messages = require("../models/Messages");

const messageUpload = async (req, res) => {
  const { sender, receiver } = req.body;
  if (!sender || !receiver)
    return res
      .status(400)
      .json({ message: "Sender and Receiver are required" });

  if (!req.files || req.files.length === 0)
    return res.status(400).json({ message: "No file uploaded" });

  const file = req.files[0];

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "chat_app_files",
      resource_type: "auto",
    });

    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting files:", err.message);
    });

    const newMessage = new Messages({
      sender,
      receiver,
      mediaUrl: result.secure_url,
      mediaType: result.resource_type,
    });

    await newMessage.save();

    res
      .status(201)
      .json({ message: "File uploaded and message saved", data: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

module.exports = messageUpload;
