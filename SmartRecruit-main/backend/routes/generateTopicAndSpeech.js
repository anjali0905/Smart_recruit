const express = require("express");
const router = express.Router();
require("dotenv").config();

const topicAndSpeechPrompt = `
Generate UNIQUE and DIVERSE Topic and Speech assessment questions based on the following difficulty level: {{prompt}}

IMPORTANT: Each question must be COMPLETELY DIFFERENT from others. Ensure maximum variety in:
- Topics (technology, business, social issues, science, environment, education, health, etc.)
- Question types (presentation, debate, explanation, discussion, etc.)
- Speaking contexts (formal, informal, professional, academic, etc.)
- Complexity and depth of topics

Create questions that:
- Present discussion topics
- Include presentation scenarios
- Focus on impromptu speaking
- Cover various subject areas
- Match the requested difficulty level
- Explore diverse domains and perspectives
- Use varied formats (presentations, debates, explanations, etc.)

Format the response as an array of strings, with each string being a question or task.

Example response format:
[
  "Give a 2-minute presentation on the impact of social media on society",
  "Discuss the pros and cons of remote work in modern businesses",
  "Present your views on environmental conservation efforts"
]

Ensure all questions are unique and cover different topics/domains.`;

router.get("/generateTopicAndSpeech", async (req, res) => {
  const prompt = req.query.prompt || "intermediate level";
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 10000);
    const customPrompt = topicAndSpeechPrompt.replace("{{prompt}}", prompt) +
      `\n\nGeneration timestamp: ${timestamp}, seed: ${randomSeed}. Ensure all questions are unique and diverse.`;
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
  const timestamp = Date.now();
  const topics = [
    "artificial intelligence in healthcare",
    "sustainable urban planning",
    "remote work culture",
    "renewable energy adoption",
    "digital privacy rights",
    "space exploration benefits"
  ];
  
  const formats = [
    "Give a short speech on: The importance of",
    "Discuss challenges and solutions related to",
    "Present a 2-minute talk: How to start with",
    "Debate: Pros and cons of",
    "Explain to a beginner in under a minute:"
  ];
  
  return Array.from({ length: 5 }, (_, i) => 
    `${formats[i]} ${topics[(timestamp + i) % topics.length]}.`
  );
}