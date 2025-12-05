const express = require("express");
const router = express.Router();
require("dotenv").config();
const listenAndSpeakPrompt = `
Generate exactly 4 sentences based on the following difficulty level: {{prompt}}

The sentences should:
- Be directly usable for listening and speaking practice
- Match the requested difficulty level
- Focus on pronunciation and fluency
- Not include any instructions, only the sentences themselves

Response format: an array of exactly 4 strings.

Example:
[
  "The cat stealthily climbed onto the rooftop.",
  "She swiftly solved the tricky puzzle.",
  "Thunder rumbled as the storm approached.",
  "His dedication to practice paid off in the finals."
]`;

router.get("/generateListenAndSpeak", async (req, res) => {
  const prompt = req.query.prompt || "intermediate level";
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const apiKey = process.env.GEN_AI_API_KEY;
  if (!apiKey) {
    console.error("GEN_AI_API_KEY is not set in environment.");
    return res.status(200).json(createMockListenSpeak(prompt));
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const customPrompt = listenAndSpeakPrompt.replace("{{prompt}}", prompt);
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
      return res.status(200).json(createMockListenSpeak(prompt));
    }
    if (!Array.isArray(questions)) {
      return res.status(200).json(createMockListenSpeak(prompt));
    }
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error generating Listen and Speak questions:", error);
    return res.status(200).json(createMockListenSpeak(prompt));
  }
});

module.exports = router;

function createMockListenSpeak(prompt) {
  return [
    `Listen to a passage about ${prompt} and repeat the main idea.`,
    `Listen to a definition related to ${prompt} and rephrase it.`,
    `Listen to a short story about ${prompt} and summarize it.`,
    `Listen to instructions about ${prompt} and list the steps.`,
  ];
}