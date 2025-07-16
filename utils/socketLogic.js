const User = require("../models/User");
const Messages = require("../models/Messages");

const userSocketmap = {};
const userToSocket = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    // Online
    socket.on("online", async (userId) => {
      userSocketmap[socket.id] = userId;
      userToSocket[userId] = socket.id;

      try {
        await User.findByIdAndUpdate(userId, { status: "online" });
        socket.broadcast.emit("user_online", { userId });
        console.log(`User ${userId} is now online`);
      } catch (error) {
        console.error("Error updating user online status:", error.message);
      }
    });

    // Send Message
    socket.on("send_message", async (data) => {
      const { sender, receiver, message } = data;

      const newMessage = new Messages({ sender, receiver, message });
      await newMessage.save();

      const receiverSocketId = userToSocket[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", data);
      }
    });

    // Disconnected
    socket.on("disconnect", async () => {
      const userId = userSocketmap[socket.id];

      if (userId) {
        try {
          await User.findByIdAndUpdate(userId, { status: "offline" });
          socket.broadcast.emit("user_offline", { userId });
          console.log(`User ${userId} is offline`);
        } catch (error) {
          console.error("Error updating user offline status:", error.message);
        }

        delete userSocketmap[socket.id];
        delete userToSocket[userId];
      }

      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
