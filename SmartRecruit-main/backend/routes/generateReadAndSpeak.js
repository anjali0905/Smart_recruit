const express = require("express");
const router = express.Router();
require("dotenv").config();

const readAndSpeakPrompt = `
Generate UNIQUE and DIVERSE Read and Speak assessment questions with COMPLETE PASSAGES and COMPREHENSION QUESTIONS based on the following difficulty level: {{prompt}}

IMPORTANT: Each question must include:
1. A FULL PASSAGE (at least 150-300 words) for the candidate to read
2. COMPREHENSION QUESTIONS (2-3 questions) about the passage
3. Instructions for the candidate to read the passage aloud and answer the questions

IMPORTANT: Each question must be COMPLETELY DIFFERENT from others. Ensure maximum variety in:
- Topics (science, business, technology, literature, current events, history, environment, health, education, etc.)
- Passage types (articles, stories, reports, essays, descriptions, etc.)
- Question types (main idea, details, inference, vocabulary, analysis, etc.)
- Passage lengths and complexity
- Assessment focus (pronunciation, comprehension, analysis, critical thinking, etc.)

Format each question as a JSON object with this structure:
{
  "passage": "Full passage text here (150-300 words minimum)",
  "questions": [
    "Comprehension question 1 about the passage",
    "Comprehension question 2 about the passage",
    "Comprehension question 3 about the passage"
  ],
  "instructions": "Read the passage aloud clearly, then answer the comprehension questions based on what you read."
}

Return an array of 3-4 such objects. Each passage must be:
- Complete and self-contained
- Appropriate for the difficulty level
- On a different topic from other passages
- Long enough to test reading comprehension (minimum 150 words)

Example format:
[
  {
    "passage": "Climate change represents one of the most pressing challenges of our time. Rising global temperatures, caused primarily by human activities such as burning fossil fuels and deforestation, are leading to severe environmental consequences. Scientists have observed melting ice caps, rising sea levels, and increasingly frequent extreme weather events. These changes threaten ecosystems, agriculture, and human settlements worldwide. Addressing climate change requires coordinated international efforts, including transitioning to renewable energy sources, implementing sustainable practices, and reducing carbon emissions. The urgency of this issue demands immediate action from governments, businesses, and individuals alike.",
    "questions": [
      "What are the main causes of climate change mentioned in the passage?",
      "What are three consequences of rising global temperatures?",
      "According to the passage, what is needed to address climate change?"
    ],
    "instructions": "Read the passage aloud clearly, then answer the comprehension questions based on what you read."
  }
]

Ensure all passages are unique, cover different topics, and include proper comprehension questions.`;

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 10000);
    const customPrompt = readAndSpeakPrompt.replace("{{prompt}}", prompt) +
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
  // Return mock data with proper structure (passage + questions)
  const topics = [
    {
      topic: "artificial intelligence",
      passage: "Artificial intelligence represents one of the most transformative technologies of our era. Machine learning algorithms can now process vast amounts of data, recognize patterns, and make predictions with remarkable accuracy. From healthcare diagnostics to autonomous vehicles, AI applications are revolutionizing industries worldwide. However, this rapid advancement also raises important questions about ethics, job displacement, and the need for responsible AI development. As we integrate AI into more aspects of daily life, balancing innovation with ethical considerations becomes increasingly crucial.",
      questions: [
        "What are some applications of artificial intelligence mentioned in the passage?",
        "What concerns does the passage raise about AI development?",
        "According to the passage, what is important when integrating AI into daily life?"
      ]
    },
    {
      topic: "sustainable development",
      passage: "Sustainable development aims to meet present needs without compromising the ability of future generations to meet their own needs. This concept encompasses environmental protection, economic growth, and social equity. Key strategies include transitioning to renewable energy sources, implementing circular economy principles, and promoting green technologies. Countries worldwide are adopting sustainable practices, recognizing that long-term prosperity depends on responsible resource management. The challenge lies in balancing immediate economic demands with long-term environmental sustainability.",
      questions: [
        "What are the three main aspects of sustainable development?",
        "What strategies are mentioned for achieving sustainability?",
        "What is the main challenge in sustainable development according to the passage?"
      ]
    },
    {
      topic: "global economics",
      passage: "The global economy has become increasingly interconnected through international trade, investment flows, and digital commerce. Economic policies in one country can have far-reaching effects on others, creating both opportunities and challenges. Emerging markets are playing a larger role in global economic growth, while developed nations face the need for economic restructuring. Digital transformation is reshaping traditional business models, and understanding these global economic dynamics is essential for businesses and policymakers alike.",
      questions: [
        "How has the global economy become interconnected?",
        "What role are emerging markets playing in global economics?",
        "What is reshaping traditional business models according to the passage?"
      ]
    }
  ];
  
  return topics.map((item) => ({
    passage: item.passage,
    questions: item.questions,
    instructions: "Read the passage aloud clearly, then answer the comprehension questions based on what you read."
  }));
}