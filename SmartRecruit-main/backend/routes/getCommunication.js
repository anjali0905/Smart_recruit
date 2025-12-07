const express = require("express");
const router = express.Router();
const Communication = require("../models/communicationModel");
const mongoose = require("mongoose");

router.get("/getCommunication/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!userId || !userId.trim()) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format" });
    }

    // Convert userId to ObjectId for query
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const communication = await Communication.findOne({ userId: userObjectId });

    if (!communication) {
      return res.status(404).json({ success: false, message: "Communication round not found. Please set up communication questions first." });
    }

    res.status(200).json({ success: true, data: communication });
  } catch (error) {
    console.error("Error in getCommunication:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;

