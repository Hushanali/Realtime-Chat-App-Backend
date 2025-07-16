const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res
        .status(400)
        .json({ message: "Email already exist. Please login." });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already exist." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "4h" });

    res.status(200).json({
      message: "User registered successfully",
      token,
      username,
      email,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "User does not exist. Please registered." });

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "4h" });

    res.status(200).json({
      message: "User logged in successfully",
      token,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
