const express = require("express");
const router = express.Router();
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post("/checkTechSolution", async (req, res) => {
  const { title, desc, code } = req.body;

  // Validate required fields with specific messages
  if (!title || !title.trim()) {
    return res
      .status(400)
      .json({ success: false, error: "Problem title is required" });
  }

  if (!desc || !desc.trim()) {
    return res
      .status(400)
      .json({ success: false, error: "Problem description is required" });
  }

  if (!code || !code.trim()) {
    return res
      .status(400)
      .json({ success: false, error: "Code cannot be empty. Please write some code before submitting." });
  }

  const apiKey = process.env.GEN_AI_API_KEY;
  if (!apiKey) {
    console.error("GEN_AI_API_KEY is not set in environment.");
    return res.status(500).json({ 
      success: false, 
      error: "Server misconfiguration: AI evaluation service is not available. Please contact support." 
    });
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
    // Use gemini-2.0-flash which is available and supports generateContent
    // Fallback to gemini-flash-latest if needed
    let model;
    let result;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      result = await model.generateContent(addOnPrompt);
    } catch (error1) {
      console.warn("gemini-2.0-flash failed, trying gemini-flash-latest:", error1.message);
      try {
        model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        result = await model.generateContent(addOnPrompt);
      } catch (error2) {
        console.error("Both models failed. Error 1:", error1.message, "Error 2:", error2.message);
        throw error2;
      }
    }

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
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", rawResponse);
      res.status(502).json({ 
        success: false, 
        error: "Failed to process evaluation response. Please try again." 
      });
    }
  } catch (error) {
    console.error("Error evaluating solution:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack
    });
    
    // Provide more specific error messages
    let errorMessage = "Failed to evaluate the solution";
    let statusCode = 500;
    
    if (error.message) {
      if (error.message.includes("API key") || error.message.includes("401") || error.message.includes("authentication") || error.message.includes("unauthorized")) {
        errorMessage = "AI service authentication failed. Please check your API key configuration.";
        statusCode = 401;
      } else if (error.message.includes("403") || error.message.includes("forbidden")) {
        errorMessage = "AI service access denied. Please check API key permissions.";
        statusCode = 403;
      } else if (error.message.includes("timeout") || error.message.includes("ECONNRESET")) {
        errorMessage = "Request timed out. Please try again.";
        statusCode = 504;
      } else if (error.message.includes("quota") || error.message.includes("limit") || error.message.includes("429")) {
        errorMessage = "AI service quota exceeded. Please try again later.";
        statusCode = 429;
      } else {
        errorMessage = `Evaluation error: ${error.message}`;
      }
    }
    
    res.status(statusCode).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
