// const mongoose = require("mongoose");

// const eachQuizSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   que: { type: String },
//   a: { type: String },
//   b: { type: String },
//   c: { type: String },
//   d: { type: String },
//   ans: { type: String },
// });

// const quizSchema = new mongoose.Schema([eachQuizSchema]);

// module.exports = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema); 

//NEW CODE

const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional if quizzes are AI-generated
    },

    que: {
      type: String,
      required: true,
      trim: true,
    },

    a: {
      type: String,
      required: true,
      trim: true,
    },

    b: {
      type: String,
      required: true,
      trim: true,
    },

    c: {
      type: String,
      required: true,
      trim: true,
    },

    d: {
      type: String,
      required: true,
      trim: true,
    },

    ans: {
      type: String,
      required: true,
      enum: ["a", "b", "c", "d"],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

module.exports = mongoose.model("Quiz", quizSchema);

