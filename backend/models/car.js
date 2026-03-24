const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  issue: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Car", CarSchema);