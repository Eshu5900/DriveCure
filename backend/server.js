// Load env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const OpenAI = require("openai");

const History = require("./models/History");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔥 MAIN ROUTE
app.post("/api/diagnose", async (req, res) => {
  try {
    const { problem } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an expert automobile mechanic.

STRICT RULES:
- Always identify EXACT ROOT CAUSE (specific component)
- DO NOT repeat user input
- Must give REAL reason (fuse, compressor, brake pads, wiring, etc.)
- Costs must be in INR
- Be practical and realistic
          `,
        },
        {
          role: "user",
          content: `
Return STRICT JSON with ALL fields:

{
  "problemSummary": "short interpreted issue",
  "mainCause": "exact root cause (specific component)",

  "topCauses": ["cause1", "cause2"],
  "solutions": ["solution1", "solution2"],

  "repairOrReplace": "Repair or Replace",

  "repairCostEstimate": "₹xxxx - ₹xxxx",
  "replaceCostEstimate": "₹xxxx - ₹xxxx",

  "canDriverFix": "Yes or No",

  "diySteps": ["step1","step2"]
}

IMPORTANT:
- NEVER leave topCauses empty
- ALWAYS give at least 2 topCauses
- NEVER leave solutions empty
- ALWAYS give at least 2 solutions
- mainCause must include exact part (bulb, fuse, compressor, brake pad)
- If canDriverFix = "No" → diySteps = []
- Keep answers practical

Problem: ${problem}
          `,
        },
      ],
    });

    let aiText = response.choices[0].message.content;

    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

    let aiResult;

    try {
      aiResult = JSON.parse(aiText);
    } catch {
      aiResult = {
        problemSummary: aiText,
        mainCause: "Unable to detect exact cause",
        topCauses: [],
        solutions: [],
        repairOrReplace: "Check manually",
        repairCostEstimate: "₹0",
        replaceCostEstimate: "₹0",
        canDriverFix: "No",
        diySteps: [],
      };
    }

    // 🔥 SAFETY FIXES (VERY IMPORTANT)

    if (!aiResult.mainCause || aiResult.mainCause.length < 5) {
      aiResult.mainCause = "Possible component failure (needs inspection)";
    }

    if (!aiResult.topCauses || aiResult.topCauses.length === 0) {
      aiResult.topCauses = [
        "Component wear or damage",
        "Electrical or wiring issue",
      ];
    }

    if (!aiResult.solutions || aiResult.solutions.length === 0) {
      aiResult.solutions = [
        "Inspect the faulty component",
        "Repair or replace damaged part",
      ];
    }

    if (!aiResult.diySteps) {
      aiResult.diySteps = [];
    }

    // 🔥 SAVE HISTORY
    await History.create({
      problem,
      result: aiResult,
    });

    res.json(aiResult);

  } catch (error) {
    console.error("AI ERROR:", error.message);
    res.status(500).json({ error: "AI failed" });
  }
});

// 🔥 HISTORY
app.get("/api/history", async (req, res) => {
  const history = await History.find().sort({ createdAt: -1 }).limit(5);
  res.json(history);
});

// Start server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));