// const express = require("express");
// const router = express.Router();
// require("dotenv").config();

// const addOnPrompt = `
// Generate an aptitude quiz with 10 questions. Each question should have:
// - A question text.
// - 4 options labeled A, B, C, and D.
// - The correct answer.
// - Questions on {{quizType}}
// Return the quiz as an array of objects in JSON format, where each object contains:
// {
//   "id": "a very unique id (not serializable)",
//   "que": "Question text",
//   "a": "option A",
//   "b": "option B",
//   "c": "option C",
//   "d": "option D",
//   "ans": "correct answer option (like a,b,c,d)"
// }
// `;

// router.get("/generateQuiz", async (req, res) => {
//   let quizType = req.query.quizType;
//   if (!quizType || quizType === null || quizType === "") {
//     quizType =
//       "aptitude including logical reasoning, problem solving, and critical thinking.";
//   }

//   // If source=gfg, fetch from GeeksforGeeks instead of AI
//   if ((req.query.source || "").toLowerCase() === "gfg") {
//     try {
//       const questions = await fetchFromGeeksForGeeks(quizType);
//       return res.status(200).json(questions);
//     } catch (e) {
//       console.error("GFG fetch failed:", e);
//       // fall back to mock
//       return res.status(200).json(createMockQuiz(quizType));
//     }
//   }

//   const { GoogleGenerativeAI } = require("@google/generative-ai");
//   const apiKey = process.env.GEN_AI_API_KEY;
//   if (!apiKey) {
//     console.error("GEN_AI_API_KEY is not set in environment.");
//     // fall back to mock if key missing
//     return res.status(200).json(createMockQuiz(quizType));
//   }
//   const genAI = new GoogleGenerativeAI(apiKey);

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const typeAddOnPrompt = addOnPrompt.replace("{{quizType}}", quizType);
//     const result = await model.generateContent(typeAddOnPrompt);
//     const rawResponse = await result.response.text();

//     // Try to extract JSON robustly
//     let jsonString = rawResponse;
//     // Prefer ```json fenced blocks
//     const jsonFenceMatch = rawResponse.match(/```json[\r\n]+([\s\S]*?)```/i);
//     if (jsonFenceMatch && jsonFenceMatch[1]) {
//       jsonString = jsonFenceMatch[1].trim();
//     } else {
//       // Fallback: any fenced block
//       const anyFenceMatch = rawResponse.match(/```[\w]*[\r\n]+([\s\S]*?)```/);
//       if (anyFenceMatch && anyFenceMatch[1]) {
//         jsonString = anyFenceMatch[1].trim();
//       } else {
//         // As last resort, try to find first [ and last ] to capture array
//         const start = rawResponse.indexOf("[");
//         const end = rawResponse.lastIndexOf("]");
//         if (start !== -1 && end !== -1 && end > start) {
//           jsonString = rawResponse.substring(start, end + 1).trim();
//         }
//       }
//     }

//     let parsed;
//     try {
//       parsed = JSON.parse(jsonString);
//     } catch (parseErr) {
//       console.error("Failed to parse AI response as JSON", { rawResponse });
//       console.warn("Returning mock quiz due to parsing failure.");
//       return res.status(200).json(createMockQuiz(quizType));
//     }

//     if (!Array.isArray(parsed)) {
//       console.warn("AI response is not an array, wrapping into array");
//       parsed = [parsed];
//     }

//     res.status(200).json(parsed);
//   } catch (error) {
//     console.error("Error generating quiz:", error);
//     console.warn("Returning mock quiz due to generation error.");
//     return res.status(200).json(createMockQuiz(quizType));
//   }
// });

// function createMockQuiz(quizType) {
//   const base = (i) => ({
//     id: `mock-${Date.now()}-${i}`,
//     que: `(${quizType}) Sample question #${i + 1}: What comes next in the sequence?`,
//     a: "Option A",
//     b: "Option B",
//     c: "Option C",
//     d: "Option D",
//     ans: ["a", "b", "c", "d"][i % 4],
//   });
//   return Array.from({ length: 10 }, (_, i) => base(i));
// }

// async function fetchFromGeeksForGeeks(quizType) {
//   const fetch = require("node-fetch");
//   const q = encodeURIComponent(`${quizType} mcq`);
//   const url = `https://www.geeksforgeeks.org/search/?q=${q}`;
//   const html = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();

//   // Naive extraction of GFG result links
//   const linkRegex = /<a[^>]+href=\"(https?:\/\/www\.geeksforgeeks\.org\/[^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi;
//   const seen = new Set();
//   const items = [];
//   let match;
//   while ((match = linkRegex.exec(html)) && items.length < 12) {
//     const href = match[1];
//     if (seen.has(href)) continue;
//     seen.add(href);
//     // Derive a readable title from the URL slug if anchor text is noisy
//     const slug = href
//       .replace(/https?:\/\/www\.geeksforgeeks\.org\//, "")
//       .replace(/\/$/, "")
//       .replace(/-/g, " ")
//       .replace(/\//g, " ")
//       .replace(/\s+/g, " ")
//       .trim();
//     const title = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : href;
//     items.push({ href, title });
//   }

//   // Map into our quiz object shape with placeholder options
//   const questions = items.slice(0, 10).map((it, i) => ({
//     id: `gfg-${Date.now()}-${i}`,
//     que: `${it.title}?`,
//     a: "Refer link: Option A",
//     b: "Refer link: Option B",
//     c: "Refer link: Option C",
//     d: "Refer link: Option D",
//     ans: "a",
//     source: it.href,
//   }));

//   if (questions.length === 0) {
//     return createMockQuiz(quizType);
//   }
//   return questions;
// }

// module.exports = router;

//NEW CODE

const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
require("dotenv").config();

/**
 * Utility function: safely parse JSON
 */
function safeJSONParse(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ JSON Parse Error:", err);
    return null;
  }
}

/**
 * Function to generate a single MCQ using AI
 */
async function generateMCQ(type, client, index = 0, total = 10) {
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 10000);
  const prompt = `
Generate 1 UNIQUE and DIVERSE multiple-choice ${type} aptitude question.

IMPORTANT: This is question ${index + 1} of ${total}. Ensure this question is COMPLETELY DIFFERENT from any other questions in the set. Avoid similar topics, patterns, or difficulty levels.

Requirements:
- The question must be unique and not repeat common patterns
- Cover different aspects of ${type} (logical reasoning, mathematical, analytical, etc.)
- Vary the difficulty and question types
- Ensure maximum diversity across all ${total} questions

Strictly return ONLY JSON in the format:

{
  "question": "",
  "options": {
    "a": "",
    "b": "",
    "c": "",
    "d": ""
  },
  "answer": "a"
}

Rules:
- The answer must be exactly one of: "a", "b", "c", or "d".
- Do NOT include explanations.
- Do NOT include markdown.
- Output strictly valid JSON only.
- Generation timestamp: ${timestamp}, seed: ${randomSeed}
  `;

  const completion = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = completion.choices[0].message.content.trim();
  const parsed = safeJSONParse(responseText);

  if (
    !parsed ||
    !parsed.question ||
    !parsed.options ||
    !parsed.options.a ||
    !parsed.options.b ||
    !parsed.options.c ||
    !parsed.options.d ||
    !parsed.answer
  ) {
    throw new Error("❌ Invalid MCQ format returned by AI");
  }

  return {
    que: parsed.question,
    a: parsed.options.a,
    b: parsed.options.b,
    c: parsed.options.c,
    d: parsed.options.d,
    ans: parsed.answer,
  };
}

/**
 * Helper: create mock quizzes when API key is missing or errors occur
 */
function createMockQuiz(type = "aptitude", count = 10) {
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 10000);
  
  // Diverse question templates based on type
  const getQuestionTemplates = (quizType) => {
    const lowerType = (quizType || "").toLowerCase();
    
    if (lowerType.includes("roman") || lowerType.includes("roman numbers")) {
      return [
        { que: "What is the Roman numeral for 15?", options: ["XV", "XIV", "XVI", "XIII"], ans: "a" },
        { que: "Convert XL to decimal number.", options: ["40", "50", "60", "30"], ans: "a" },
        { que: "What is the Roman numeral for 99?", options: ["XCIX", "IC", "LXLIX", "XCXI"], ans: "a" },
        { que: "Convert CCL to decimal number.", options: ["250", "200", "300", "150"], ans: "a" },
        { que: "What is the Roman numeral for 444?", options: ["CDXLIV", "CCCCXLIV", "CDXLIIII", "CCCCXLIIII"], ans: "a" },
        { que: "Convert MCMXCIV to decimal number.", options: ["1994", "1996", "1992", "1998"], ans: "a" },
        { que: "What is the Roman numeral for 27?", options: ["XXVII", "XXVIII", "XXVI", "XXIX"], ans: "a" },
        { que: "Convert DCCL to decimal number.", options: ["750", "700", "800", "650"], ans: "a" },
        { que: "What is the Roman numeral for 88?", options: ["LXXXVIII", "LXXXVII", "LXXXIX", "LXXXVI"], ans: "a" },
        { que: "Convert MMXXIV to decimal number.", options: ["2024", "2022", "2026", "2020"], ans: "a" },
        { que: "What is the Roman numeral for 156?", options: ["CLVI", "CLV", "CLVII", "CLIV"], ans: "a" },
        { que: "Convert CDXLV to decimal number.", options: ["445", "455", "435", "465"], ans: "a" },
        { que: "What is the Roman numeral for 333?", options: ["CCCXXXIII", "CCCXXXII", "CCCXXXIV", "CCCXXX"], ans: "a" },
        { que: "Convert LXXXVIII to decimal number.", options: ["88", "78", "98", "68"], ans: "a" },
        { que: "What is the Roman numeral for 777?", options: ["DCCLXXVII", "DCCLXXVI", "DCCLXXVIII", "DCCLXXV"], ans: "a" },
      ];
    }
    
    // General aptitude questions
    return [
      { que: "If a train travels 120 km in 2 hours, what is its average speed?", options: ["60 km/h", "50 km/h", "70 km/h", "55 km/h"], ans: "a" },
      { que: "What is 25% of 200?", options: ["50", "40", "60", "45"], ans: "a" },
      { que: "If 3x + 5 = 20, what is the value of x?", options: ["5", "4", "6", "7"], ans: "a" },
      { que: "What is the next number in the sequence: 2, 4, 8, 16, ?", options: ["32", "24", "28", "30"], ans: "a" },
      { que: "A rectangle has length 8 cm and width 5 cm. What is its area?", options: ["40 cm²", "35 cm²", "45 cm²", "30 cm²"], ans: "a" },
      { que: "If 5 workers can complete a task in 10 days, how many days will 10 workers take?", options: ["5 days", "10 days", "15 days", "20 days"], ans: "a" },
      { que: "What is the square root of 144?", options: ["12", "11", "13", "14"], ans: "a" },
      { que: "If a number is increased by 20% and becomes 120, what was the original number?", options: ["100", "110", "90", "95"], ans: "a" },
      { que: "What is 15 × 8?", options: ["120", "115", "125", "130"], ans: "a" },
      { que: "If the ratio of boys to girls is 3:2 and there are 30 boys, how many girls are there?", options: ["20", "25", "15", "18"], ans: "a" },
      { que: "What is the value of 2³ + 3²?", options: ["17", "15", "19", "13"], ans: "a" },
      { que: "A shop offers 15% discount. If an item costs $100, what is the discounted price?", options: ["$85", "$80", "$90", "$75"], ans: "a" },
      { que: "What is the next prime number after 17?", options: ["19", "18", "20", "21"], ans: "a" },
      { que: "If 4x = 28, what is x?", options: ["7", "6", "8", "9"], ans: "a" },
      { que: "What is the sum of angles in a triangle?", options: ["180°", "90°", "360°", "270°"], ans: "a" },
    ];
  };
  
  const templates = getQuestionTemplates(type);
  const usedIndices = new Set();
  
  return Array.from({ length: count }, (_, i) => {
    // Use modulo to cycle through templates, but add randomness
    const templateIndex = (timestamp + randomSeed + i) % templates.length;
    const template = templates[templateIndex];
    
    return {
      id: `mock-${timestamp}-${randomSeed}-${i}`,
      que: template.que,
      a: template.options[0],
      b: template.options[1],
      c: template.options[2],
      d: template.options[3],
      ans: template.ans,
    };
  });
}

/**
 * Shared handler to generate quizzes (supports GET/POST)
 */
async function handleGenerateQuiz(req, res) {
  const count = Number(req.body.count || req.query.count || 10);
  const type =
    req.body.type ||
    req.query.type ||
    req.body.quizType ||
    req.query.quizType ||
    "aptitude";
  const source = req.body.source || req.query.source;
  const forceMock =
    (process.env.QUIZ_FORCE_MOCK || "").toLowerCase() === "true";

  if (!count || !type) {
    return res.status(400).json({
      success: false,
      error: "Both 'count' and 'type' are required",
    });
  }

  // If forced mock, return mock immediately
  // But try AI generation even if source=gfg (GFG scraping is not reliable)
  if (forceMock) {
    return res.status(200).json({
      success: true,
      count,
      type,
      source,
      quizzes: createMockQuiz(type, count),
      mock: true,
      note: "QUIZ_FORCE_MOCK enabled; returning mock quiz.",
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set. Returning mock quiz.");
    return res.status(200).json({
      success: true,
      count,
      type,
      source,
      quizzes: createMockQuiz(type, count),
      mock: true,
      note: "OPENAI_API_KEY missing; returned mock quiz.",
    });
  }

  const client = new OpenAI({ apiKey });

  try {
    const quizzes = [];
    for (let i = 0; i < count; i++) {
      const quiz = await generateMCQ(type, client, i, count);
      quizzes.push(quiz);
      // Add small delay to ensure variety in AI responses
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      type,
      source,
      quizzes,
    });
  } catch (error) {
    // Soft-fail with mock data and 200 so the frontend can continue
    const message =
      (error && error.message) ||
      "Quiz generation failed; falling back to mock.";
    if (process.env.NODE_ENV !== "production") {
      console.warn("Quiz generation failed, returning mock:", message);
    }
    // Soft-fail with mock data and 200 so the frontend can continue
    return res.status(200).json({
      success: true,
      count,
      type,
      source,
      quizzes: createMockQuiz(type, count),
      mock: true,
      note: "AI generation failed; returned mock quiz.",
      error: message,
    });
  }
}

// Preserve the expected route signature for the frontend (GET)
router.get("/generateQuiz", handleGenerateQuiz);
// Also support POST /generateQuiz for flexibility
router.post("/generateQuiz", handleGenerateQuiz);

module.exports = router;

