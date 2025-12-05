const express = require("express");
const router = express.Router();
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post("/checkTechSolution", async (req, res) => {
  const { title, desc, code } = req.body;

  if (!title || !desc || !code) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  const apiKey = process.env.GEN_AI_API_KEY;
  if (!apiKey) {
    console.error("GEN_AI_API_KEY is not set in environment.");
    return res.status(500).json({ success: false, error: "Server misconfiguration: missing AI API key" });
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  const addOnPrompt = `
  ${title}
    ${desc}
    ${code}
    Evaluate the following code solution against given problem requirements:
    1. Check the solution against multiple test cases.
    2. Return if the solution passes or fails each test case.
    3. Provide hint for error messages for failed cases, including input and expected vs actual output.
    4. Return the evaluation result in JSON format with the following structure exactly:
    5. Respoonse should be small like around 10 lines. MAKE SURE YOU SHOULD NOT GIVE ANY SOLUTIONS IN THE RESPONSE.
    6. Check the solution properly, even a small error in the code may lead to a failed evaluation.
    {
      "success": true/false,
      "summary": "Summary of the evaluation"
    }
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(addOnPrompt);

    // Get the raw response text
    const rawResponse = await result.response.text();

    // Try robust parsing: ```json blocks, any fence, or object braces
    let jsonString = rawResponse;
    const jsonFenceMatch = rawResponse.match(/```json[\r\n]+([\s\S]*?)```/i);
    if (jsonFenceMatch && jsonFenceMatch[1]) {
      jsonString = jsonFenceMatch[1].trim();
    } else {
      const anyFenceMatch = rawResponse.match(/```[\w]*[\r\n]+([\s\S]*?)```/);
      if (anyFenceMatch && anyFenceMatch[1]) {
        jsonString = anyFenceMatch[1].trim();
      } else {
        const start = rawResponse.indexOf("{");
        const end = rawResponse.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
          jsonString = rawResponse.substring(start, end + 1).trim();
        }
      }
    }

    try {
      const cleanedResponse = JSON.parse(jsonString);
      res.status(200).json({ success: true, cleanedResponse });
    } catch (parseError) {
      console.error("Error parsing response:", parseError, { rawResponse });
      res.status(502).json({ success: false, error: "AI response parsing failed" });
    }
  } catch (error) {
    console.error("Error evaluating solution:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to evaluate the solution" });
  }
});

module.exports = router;
