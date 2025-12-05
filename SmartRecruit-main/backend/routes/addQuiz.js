// const express = require("express");
// const router = express.Router();
// const Quiz = require("../models/quizModel");
// const User = require("../models/userModel");

// router.post("/addQuiz", async (req, res) => {
//   const { userId, questions } = req.body; // Accept userId and an array of questions

//   try {
//     // Map questions to the required quiz format
//     const quizzesToSave = questions.map((quiz) => ({
//       que: quiz.que,
//       a: quiz.a,
//       b: quiz.b,
//       c: quiz.c,
//       d: quiz.d,
//       ans: quiz.ans,
//     }));

//     // Insert quizzes into Quiz collection
//     const savedQuizzes = await Quiz.insertMany(quizzesToSave);

//     // Prepare quiz data to store directly in user's allAptitudes
//     const quizDataForUser = savedQuizzes.map((quiz) => ({
//       que: quiz.que,
//       a: quiz.a,
//       b: quiz.b,
//       c: quiz.c,
//       d: quiz.d,
//       ans: quiz.ans,
//     }));

//     // Update the user model to store quizzes in allAptitudes
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $push: { allAptitudes: { $each: quizDataForUser } } },
//       { new: true } // Return the updated user document
//     );

//     res.status(201).json({
//       success: true,
//       quizzes: savedQuizzes,
//       user: updatedUser,
//     });
//   } catch (err) {
//     console.error("Error saving quizzes:", err);
//     res.status(500).send("Something went wrong while adding quizzes.");
//   }
// });

// module.exports = router; 

//NEW CODE

const express = require("express");
const router = express.Router();
const Quiz = require("../models/quizModel");

/**
 * Validate one quiz object
 */
function validateQuiz(q) {
  if (
    !q.que ||
    !q.a ||
    !q.b ||
    !q.c ||
    !q.d ||
    !q.ans
  ) {
    return "Missing required fields";
  }

  if (!["a", "b", "c", "d"].includes(q.ans.toLowerCase())) {
    return "Answer must be one of: a, b, c, d";
  }

  return null; // No errors
}

/**
 * Route: POST /addQuiz
 * Purpose: Add single or multiple quiz questions
 */
router.post("/", async (req, res) => {
  try {
    const { questions, userId, passingMarks } = req.body || {};
    let quizzes = questions || req.body;

    // Ensure quizzes is an array
    if (!Array.isArray(quizzes)) {
      quizzes = [quizzes];
    }

    // Validate each quiz
    for (let q of quizzes) {
      const error = validateQuiz(q);
      if (error) {
        return res.status(400).json({
          success: false,
          error: `Invalid quiz format: ${error}`,
          quiz: q,
        });
      }
    }

    // Save to DB
    const saved = await Quiz.insertMany(quizzes);

    res.status(200).json({
      success: true,
      message: "Quiz saved successfully",
      count: saved.length,
      quizzes: saved,
      userId: userId || null,
      passingMarks: passingMarks || null,
    });
  } catch (err) {
    console.error("🔥 ERROR in addQuiz:", err);
    res.status(500).json({
      success: false,
      error: "Failed to save quiz",
      details: err.message,
    });
  }
});

module.exports = router;

