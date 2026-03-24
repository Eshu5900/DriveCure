const express = require("express");
const router = express.Router();

const History = require("../models/History");

router.get("/", async (req, res) => {
  try {
    const history = await History.find().sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;