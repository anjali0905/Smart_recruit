const express = require("express");
const router = express.Router();
require("dotenv").config();

const topicAndSpeechPrompt = `
Generate Topic and Speech assessment questions based on the following difficulty level: {{prompt}}

Create questions that:
- Present discussion topics
- Include presentation scenarios
- Focus on impromptu speaking
- Cover various subject areas
- Match the requested difficulty level

Format the response as an array of strings, with each string being a question or task.

Example response format:
[
  "Give a 2-minute presentation on the impact of social media on society",
  "Discuss the pros and cons of remote work in modern businesses",
  "Present your views on environmental conservation efforts"
]`;

router.get("/generateTopicAndSpeech", async (req, res) => {
  const prompt = req.query.prompt || "intermediate level";
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const customPrompt = topicAndSpeechPrompt.replace("{{prompt}}", prompt);
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
      return res.status(200).json(createMockTopicSpeech(prompt));
    }
    if (!Array.isArray(questions)) {
      return res.status(200).json(createMockTopicSpeech(prompt));
    }
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error generating Topic and Speech questions:", error);
    return res.status(200).json(createMockTopicSpeech(prompt));
  }
});

module.exports = router;

function createMockTopicSpeech(prompt) {
  return [
    `Give a short speech on: The importance of ${prompt}.`,
    `Discuss challenges and solutions related to ${prompt}.`,
    `Present a 2-minute talk: How to start with ${prompt}.`,
    `Debate: Pros and cons of ${prompt}.`,
    `Explain ${prompt} to a beginner in under a minute.`,
  ];
}