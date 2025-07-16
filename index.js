const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/message");
const userRoutes = require("./routes/user");
const { Server } = require("socket.io");
const socketHandler = require("./utils/socketLogic");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

dotenv.config();

app.use(express.json());
app.use(cors());

// Connecting Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDb connected");
  })
  .catch((error) => {
    console.error("Error while connecting Database", error.message);
  });

// Socket
socketHandler(io);

// Routes
app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/users", userRoutes);

// Port
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`Server running on Port:${PORT}`);
  });
}

module.exports = { app, server };
