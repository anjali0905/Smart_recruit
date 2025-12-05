const express = require("express");
const router = express.Router();
require("dotenv").config();

const addOnPrompt = `
Generate a set of 4 technical interview questions on {{techType}} DSA problems. Each problem should include:
- A unique ID for the problem (not serializable).
- A title describing the problem.
- A detailed description of the problem, including:
  - Problem statement.
  - Input format.
  - Output format.
  - Example with input and output.
  - Constraints for the problem.
- Two test cases with:
  - A sample input for the problem.
  - The expected output for the provided input.

Format the description as a single string with line breaks and spaces for readability.
Return the set of problems as an array of objects in JSON format, where each object follows this structure:
{
  "id": "unique problem ID",
  "title": "Problem title",
  "desc": "Detailed problem description with proper formatting",
  "testCases": [
    {
      "input": "Sample input",
      "expectedOutput": "Expected output"
    },
    {
      "input": "Sample input",
      "expectedOutput": "Expected output"
    }
  ]
}`;

router.get("/generateTech", async (req, res) => {
  const techType = req.query.techType;
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const apiKey = process.env.GEN_AI_API_KEY;
  if (!apiKey) {
    console.error("GEN_AI_API_KEY is not set in environment.");
    // If asked to use gfg source, try that first
    if ((req.query.source || "").toLowerCase() === "gfg") {
      try {
        return res.status(200).json(await fetchTechFromGFG(techType));
      } catch (e) {
        console.error("GFG tech fetch failed:", e);
        return res.status(200).json(createMockTech(techType));
      }
    }
    return res.status(200).json(createMockTech(techType));
  }
  // Optional: allow GFG scraping on demand
  if ((req.query.source || "").toLowerCase() === "gfg") {
    try {
      return res.status(200).json(await fetchTechFromGFG(techType));
    } catch (e) {
      console.error("GFG tech fetch failed:", e);
      // fall through to AI flow
    }
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const typeAddOnPrompt = addOnPrompt.replace("{{techType}}", techType);
    const result = await model.generateContent(typeAddOnPrompt);

    // Extract and parse the raw response robustly
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

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Failed to parse AI response as JSON", { rawResponse });
      console.warn("Returning mock tech set due to parsing failure.");
      return res.status(200).json(createMockTech(techType));
    }

    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error("Error generating tech quiz:", error);
    console.warn("Returning mock tech set due to generation error.");
    return res.status(200).json(createMockTech(techType));
  }
});

function createMockTech(techType) {
  const make = (i) => ({
    id: `mock-tech-${Date.now()}-${i}`,
    title: `${techType || "DSA"} Problem #${i + 1}`,
    desc: `Solve a simple ${techType || "array"} task.\nInput format: ...\nOutput format: ...\nExample: ...`,
    testCases: [
      { input: "1 2 3", expectedOutput: "6" },
      { input: "2 2", expectedOutput: "4" },
    ],
  });
  return Array.from({ length: 4 }, (_, i) => make(i));
}

async function fetchTechFromGFG(techType) {
  const fetch = require("node-fetch");
  const q = encodeURIComponent(`${techType || "dsa"} coding problems`);
  const url = `https://www.geeksforgeeks.org/search/?q=${q}`;
  const html = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();

  const linkRegex = /<a[^>]+href=\"(https?:\/\/www\.geeksforgeeks\.org\/[^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set();
  const items = [];
  let match;
  while ((match = linkRegex.exec(html)) && items.length < 6) {
    const href = match[1];
    if (seen.has(href)) continue;
    seen.add(href);
    const slug = href
      .replace(/https?:\/\/www\.geeksforgeeks\.org\//, "")
      .replace(/\/$/, "")
      .replace(/-/g, " ")
      .replace(/\//g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const title = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : href;
    items.push({ href, title });
  }

  const problems = (items.slice(0, 4).length ? items.slice(0, 4) : items.slice(0, 4)).map((it, i) => ({
    id: `gfg-tech-${Date.now()}-${i}`,
    title: it.title,
    desc: `Refer to: ${it.href}\n\nDescribe the problem and constraints in your own words. Provide example input/output.`,
    testCases: [
      { input: "sample input", expectedOutput: "sample output" },
      { input: "another input", expectedOutput: "another output" },
    ],
    source: it.href,
  }));

  return problems.length ? problems : createMockTech(techType);
}

module.exports = router;
