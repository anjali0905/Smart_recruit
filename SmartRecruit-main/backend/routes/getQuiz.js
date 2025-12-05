// const express = require("express");
// const router = express.Router();
// const Quiz = require("../models/quizModel");
// const User = require("../models/userModel");

// router.get("/getQuiz", async (req, res) => {
//   const { userId } = req.query;

//   try {
//     let quizzes;

//     if (userId) {
//       // If userId is provided, get the user's allAptitudes
//       const user = await User.findById(userId); // Correct method to fetch a single document
//       if (!user) {
//         return res.status(404).send("User not found");
//       }
//       quizzes = user.allAptitudes; // Access the user's allAptitudes array
//     } else {
//       // If userId is not provided,
//       quizzes = await Quiz.find();
//     }

//     // Map through quizzes if they exist
//     const modifiedQuizzes = quizzes?.map((quiz) => {
//       quiz.id = quiz._id;

//       return quiz;
//     });

//     res.status(200).json(modifiedQuizzes);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Something went wrong from backend");
//   }
// });

// module.exports = router;

//NEW CODE
const express = require("express");
const router = express.Router();
const Quiz = require("../models/quizModel");

/**
 * Route: GET /getQuiz
 * Optional Query Params:
 *    - limit (number of questions)
 *    - type (aptitude / technical) → only if you add this field later
 */
router.get("/", async (req, res) => {
  try {
    const { limit } = req.query;

    // Sanitize limit input
    const quizLimit = limit ? parseInt(limit) : null;

    // Fetch quizzes (limit optional)
    const quizzes = quizLimit
      ? await Quiz.find().limit(quizLimit)
      : await Quiz.find();

    // Transform response (optional but clean)
    const formatted = quizzes.map((q) => ({
      id: q._id,
      question: q.que,
      options: {
        a: q.a,
        b: q.b,
        c: q.c,
        d: q.d,
      },
      answer: q.ans,
      createdAt: q.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      quizzes: formatted,
    });
  } catch (error) {
    console.error("🔥 ERROR in getQuiz:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch quiz questions",
      details: error.message,
    });
  }
});

module.exports = router;
