const express = require("express");
const router = express.Router();
const Car = require("../models/Car");

// Save car issue
router.post("/", async (req, res) => {
  try {
    const { brand, model, issue } = req.body;

    const newCar = new Car({
      brand,
      model,
      issue
    });

    const savedCar = await newCar.save();

    res.json({
      message: "Car issue saved successfully",
      data: savedCar
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;