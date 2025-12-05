const express = require("express");
const router = express.Router();
require("dotenv").config();

const readAndSpeakPrompt = `
Generate Read and Speak assessment questions based on the following difficulty level: {{prompt}}

Create questions that:
- Include passages for reading aloud
- Test pronunciation accuracy
- Focus on stress and intonation
- Include comprehension questions
- Match the requested difficulty level

Format the response as an array of strings, with each string being a question or task.

Example response format:
[
  "Read this paragraph about climate change and explain the main arguments",
  "Practice these tongue twisters and explain their meaning",
  "Read this business proposal and present its key points"
]`;

router.get("/generateReadAndSpeak", async (req, res) => {
  const prompt = req.query.prompt || "intermediate level";
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const apiKey = process.env.GEN_AI_API_KEY;
  if (!apiKey) {
    console.error("GEN_AI_API_KEY is not set in environment.");
    // Fallback to mock if key is missing
    return res.status(200).json(createMockReadSpeak(prompt));
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const customPrompt = readAndSpeakPrompt.replace("{{prompt}}", prompt);
    const result = await model.generateContent(customPrompt);
    const rawResponse = await result.response.text();
    let jsonString = rawResponse;
    const jsonFenceMatch = rawResponse.match(/```json[\r\n]+([\s\S]*?)```/i);
    if (jsonFenceMatch && jsonFenceMatch[1]) {
      jsonString = jsonFenceMatch[1].trim();
    } else {
      const anyFenceMatch = rawResponse.match(/```[\w]*[\r\n]+([\s\S]*?)```/);
      if (anyFenceMatch && anyFenceMatch[1]) {
        jsonString = anyFenceMatch[1].trim();
      } else {
        const start = rawResponse.indexOf("[");
        const end = rawResponse.lastIndexOf("]");
        if (start !== -1 && end !== -1 && end > start) {
          jsonString = rawResponse.substring(start, end + 1).trim();
        }
      }
    }

    let questions;
    try {
      questions = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Failed to parse AI response as JSON", { rawResponse });
      return res.status(200).json(createMockReadSpeak(prompt));
    }
    if (!Array.isArray(questions)) {
      return res.status(200).json(createMockReadSpeak(prompt));
    }
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error generating Read and Speak questions:", error);
    return res.status(200).json(createMockReadSpeak(prompt));
  }
});

module.exports = router;

function createMockReadSpeak(prompt) {
  const base = (i) => `Read this short paragraph about ${prompt} and summarize the key point #${i+1}.`;
  return Array.from({ length: 6 }, (_, i) => base(i));
}