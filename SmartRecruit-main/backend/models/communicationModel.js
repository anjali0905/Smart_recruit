const mongoose = require("mongoose");

// Schema for Read and Speak questions (objects with passage, questions, instructions)
const readAndSpeakQuestionSchema = new mongoose.Schema({
  passage: { type: String, required: true },
  questions: { type: [String], default: [] },
  instructions: { type: String, default: "Read the passage aloud clearly, then answer the comprehension questions." }
}, { _id: false });

const communicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  readAndSpeak: {
    type: [mongoose.Schema.Types.Mixed], // Can be objects or strings for backward compatibility
    default: [],
  },
  listenAndSpeak: {
    type: [mongoose.Schema.Types.Mixed], // Can be objects or strings
    default: [],
  },
  topicAndSpeech: {
    type: [mongoose.Schema.Types.Mixed], // Can be objects or strings
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.models.communicationSchema || mongoose.model("Communication", communicationSchema);
