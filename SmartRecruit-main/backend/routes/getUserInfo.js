const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const mongoose = require("mongoose");

// Route to get user information by userId
router.get("/getUserInfo/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate userId format
    if (!userId || !userId.trim()) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back the user information
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message || "An unexpected error occurred"
    });
  }
});

module.exports = router;
