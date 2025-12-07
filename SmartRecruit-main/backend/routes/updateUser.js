const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

router.post("/updateUser", async (req, res) => {
  const {
    userId,
    date,
    startTime,
    endTime,
    name,
    companyName,
    email,
    jobrole,
    passingMarks,
    userEmail,
    aptitudePassingMarks,
    aptitudePassesCandidates,
    aptitudeFailedCandidates,
    techPassesCandidates,
    techFailedCandidates,
    aptitudeSolved,
    techSolved,
    score,
    candidateData,
    aptitudeTime,
    techTime,
    hrTime,
    passingMarksofTech,
    technicalScore,
  } = req.body;

  // Validate userId
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  console.log(
    "Data of technical round came to backend : ",
    userId,
    userEmail,
    technicalScore
  );

  let techPass = false;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details
    if (date) user.date = date;
    if (name) user.name = name;
    if (passingMarksofTech) user.technicalPassingMarks = passingMarksofTech;
    if (companyName) user.companyName = companyName;
    if (jobrole) user.jobRole = jobrole;
    if (passingMarks) user.aptitudePassingMarks = passingMarks;
    if (startTime) user.startTime = startTime;
    if (endTime) user.endTime = endTime;
    if (candidateData) user.candidateData = candidateData;
    if (aptitudeTime) user.aptitudeTime = aptitudeTime;
    if (techTime) user.techTime = techTime;
    if (hrTime) user.hrTime = hrTime;

    // Check aptitude results
    if (score !== undefined) {
      if (!user.aptitudePassesCandidates.includes(userEmail)) {
        user.aptitudePassesCandidates.push(userEmail);
      }
    }

    // Check technical results if technicalScore is provided
    if (technicalScore !== undefined) {
      if (!user.techPassesCandidates.includes(userEmail)) {
        user.techPassesCandidates.push(userEmail);
        techPass = true;
      }
    }

    // Update email if provided
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User updated successfully", techPass });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message || "An unexpected error occurred"
    });
  }
});

module.exports = router;
