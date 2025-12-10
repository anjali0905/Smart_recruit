const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.197.79:5173", // Network IP for candidates
    "http://192.168.3.245:5173", // Network IP for candidates
    "http://192.168.6.168:5173", // Previous network IP
    "http://192.168.1.182:5173", // Current network IP
    /^http:\/\/192\.168\.\d+\.\d+:5173$/, // Allow any 192.168.x.x network IP
    /^http:\/\/10\.\d+\.\d+\.\d+:5173$/, // Allow 10.x.x.x network IPs
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:5173$/, // Allow 172.16-31.x.x network IPs
    "https://smartrecruit.vercel.app", // for quick testing purpose included this hardcoded urls
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "multipart/form-data"],
  credentials: true,
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database Connected ");
  })
  .catch((err) => console.error("Database Connection Failed: ", err));

const User = require("./models/userModel");

// Real-time text update logic
let currentText = "";

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial data
  res.write(`data: ${JSON.stringify({ text: currentText })}\n\n`);

  const intervalId = setInterval(() => {
    res.write(`data: ${JSON.stringify({ text: currentText })}\n\n`);
  }, 1000);

  req.on("close", () => {
    clearInterval(intervalId);
  });
});

app.post("/api/update", (req, res) => {
  currentText = req.body.text;
  res.status(200).send("Text updated successfully");
});

// Other route imports
const signup = require("./routes/signup");
const login = require("./routes/login");
const addQuiz = require("./routes/addQuiz");
const getQuiz = require("./routes/getQuiz");
const generateQuiz = require("./routes/generateQuiz"); // quiz generation
const updateUser = require("./routes/updateUser");
const generateTech = require("./routes/generateTech");
const addTech = require("./routes/addTech");
const getTech = require("./routes/getTech");
const getUserInfo = require("./routes/getUserInfo");
const checkTechSolution = require("./routes/checkTechSolution");
const cheatingDetected = require("./routes/cheatingDetected");

const allJob = require("./routes/allJob");
const createJob = require("./routes/createJob");
const updateJob = require("./routes/updateJob");
const deleteJob = require("./routes/deleteJob");
const allUser = require("./routes/allUser");
const getJob = require("./routes/getJob");
const scanResume = require("./routes/scanResume");
const getExcelFile = require("./routes/getExcelFile");
const jobs = require("./routes/jobs");

const addCommunication = require("./routes/addCommunication");
const allCommunication = require("./routes/allCommunication");
const getCommunication = require("./routes/getCommunication");

const generateListenAndSpeak = require("./routes/generateListenAndSpeak");
const generateReadAndSpeak = require("./routes/generateReadAndSpeak");
const generateTopicAndSpeech = require("./routes/generateTopicAndSpeech");
const allScores = require("./routes/allScores");
const addScore = require("./routes/addScore");
const addHRInterviewAnalysis = require("./routes/addHRInterviewAnalysis");

// Apply routes
app.use(allScores);
app.use(addScore);
app.use(addHRInterviewAnalysis);
app.use(addCommunication);
app.use(allCommunication);
app.use(getCommunication);

app.use(generateListenAndSpeak);
app.use(generateReadAndSpeak);
app.use(generateTopicAndSpeech);

app.use(signup);
app.use(login);
// Aptitude quiz routes
app.use("/addQuiz", addQuiz);       // POST /addQuiz
app.use("/getQuiz", getQuiz);       // GET /getQuiz
app.use(generateQuiz);              // GET/POST /generateQuiz

app.use(updateUser);
app.use(generateTech);
app.use(addTech);
app.use(getTech);
app.use(getUserInfo);
app.use(checkTechSolution);
app.use(cheatingDetected);

app.use(allJob);
app.use(createJob);
app.use(updateJob);
app.use(deleteJob);
app.use(allUser);
app.use(getJob);
app.use(scanResume);
app.use(getExcelFile);
app.use(jobs);

// Test route for users
app.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.send("Error, check console");
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Server setup
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log("Loaded PORT from .env:", process.env.PORT);
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at: http://localhost:${PORT}`);
  console.log(`Server accessible on network at: http://0.0.0.0:${PORT}`);
});

module.exports = app;

