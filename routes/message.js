const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const messageUpload = require("../controllers/messageUpload");
const verifyToken = require("../middleware/verifyToken");
const Messages = require("../models/Messages");

router.post(
  "/upload",
  verifyToken,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  messageUpload
);

router.get("/", verifyToken, async (req, res) => {
  const { sender, receiver } = req.query;
  try {
    const messages = await Messages.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

module.exports = router;
