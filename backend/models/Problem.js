const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  problem: String,
  causes: [String],
  solutions: [String]
});

module.exports = mongoose.model("Problem", problemSchema);