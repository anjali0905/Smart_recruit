const express = require('express');
const router = express.Router();
const CandidateScore = require('../models/scoreModel');

router.post('/addHRInterviewAnalysis', async (req, res) => {
  try {
    const { userId, candidateEmail, emotionData, averageConfidence, dominantEmotions, communicationClarity, overallScore } = req.body;

    if (!userId || !candidateEmail) {
      return res.status(400).json({
        success: false,
        message: "userId and candidateEmail are required"
      });
    }

    // Find existing record or create new one
    let candidateScore = await CandidateScore.findOne({
      userId: userId,
      candidateEmail: candidateEmail
    });

    if (!candidateScore) {
      candidateScore = new CandidateScore({
        userId,
        candidateEmail,
        aptitudeScore: 0,
        communicationScore: 0,
        technicalScore: 0,
        hrInterviewScore: overallScore || 0,
        hrInterviewAnalysis: {
          emotionData: emotionData || [],
          averageConfidence: averageConfidence || 0,
          dominantEmotions: dominantEmotions || [],
          communicationClarity: communicationClarity || 0,
          overallScore: overallScore || 0
        }
      });
    } else {
      // Update HR interview analysis
      candidateScore.hrInterviewScore = overallScore || candidateScore.hrInterviewScore || 0;
      candidateScore.hrInterviewAnalysis = {
        emotionData: emotionData || candidateScore.hrInterviewAnalysis?.emotionData || [],
        averageConfidence: averageConfidence || candidateScore.hrInterviewAnalysis?.averageConfidence || 0,
        dominantEmotions: dominantEmotions || candidateScore.hrInterviewAnalysis?.dominantEmotions || [],
        communicationClarity: communicationClarity || candidateScore.hrInterviewAnalysis?.communicationClarity || 0,
        overallScore: overallScore || candidateScore.hrInterviewAnalysis?.overallScore || 0
      };
    }

    await candidateScore.save();

    res.status(200).json({
      success: true,
      message: "HR interview analysis added successfully",
      data: candidateScore
    });

  } catch (error) {
    console.error("Error in addHRInterviewAnalysis route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;


