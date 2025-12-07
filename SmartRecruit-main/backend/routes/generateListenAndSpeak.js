const express = require("express");
const router = express.Router();
require("dotenv").config();
const listenAndSpeakPrompt = `
Generate exactly 4 UNIQUE and DIVERSE sentences based on the following difficulty level: {{prompt}}

IMPORTANT: Each sentence must be COMPLETELY DIFFERENT from the others. Ensure maximum variety in:
- Topics (science, business, technology, nature, personal, professional, etc.)
- Sentence structures (simple, complex, compound)
- Vocabulary and complexity
- Contexts and scenarios

The sentences should:
- Be directly usable for listening and speaking practice
- Match the requested difficulty level
- Focus on pronunciation and fluency
- Not include any instructions, only the sentences themselves
- Cover diverse topics and contexts
- Use varied vocabulary and sentence patterns

Response format: an array of exactly 4 strings.

Example:
[
  "The cat stealthily climbed onto the rooftop.",
  "She swiftly solved the tricky puzzle.",
  "Thunder rumbled as the storm approached.",
  "His dedication to practice paid off in the finals."
]

Ensure all 4 sentences are unique and cover different topics/contexts.`;

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 10000);
    const customPrompt = listenAndSpeakPrompt.replace("{{prompt}}", prompt) +
      `\n\nGeneration timestamp: ${timestamp}, seed: ${randomSeed}. Ensure all sentences are unique and diverse.`;
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
  const timestamp = Date.now();
  const topics = [
    "technology and innovation",
    "business and entrepreneurship",
    "science and research",
    "environmental conservation",
    "education and learning",
    "health and wellness",
    "social issues",
    "cultural diversity"
  ];
  
  return [
    `Listen to a passage about ${topics[timestamp % topics.length]} and repeat the main idea.`,
    `Listen to a definition related to ${topics[(timestamp + 1) % topics.length]} and rephrase it.`,
    `Listen to a short story about ${topics[(timestamp + 2) % topics.length]} and summarize it.`,
    `Listen to instructions about ${topics[(timestamp + 3) % topics.length]} and list the steps.`,
  ];
}