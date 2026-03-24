const mongoose = require("mongoose");
const Problem = require("./models/Problem");

// MongoDB connection
mongoose.connect("mongodb+srv://mechuser:mech123@cluster0.kcsvbvf.mongodb.net/mechai")
.then(() => console.log("MongoDB Connected for seeding"))
.catch(err => console.log(err));

// Vehicle problems dataset
const problems = [
  {
    problem: "car not starting",
    causes: ["Dead battery", "Starter motor failure", "Fuel pump issue"],
    solutions: ["Charge or replace battery", "Check starter motor", "Inspect fuel pump"]
  },
  {
    problem: "engine overheating",
    causes: ["Low coolant", "Radiator issue", "Thermostat failure"],
    solutions: ["Refill coolant", "Check radiator", "Replace thermostat"]
  },
  {
    problem: "brake noise",
    causes: ["Worn brake pads", "Brake disc damage"],
    solutions: ["Replace brake pads", "Inspect brake discs"]
  },
  {
    problem: "car vibrating",
    causes: ["Wheel imbalance", "Worn suspension"],
    solutions: ["Balance wheels", "Inspect suspension system"]
  },
  {
    problem: "battery draining quickly",
    causes: ["Old battery", "Alternator failure"],
    solutions: ["Replace battery", "Check alternator"]
  },
  {
    problem: "white smoke from exhaust",
    causes: ["Coolant leak into engine", "Blown head gasket"],
    solutions: ["Check head gasket", "Inspect coolant system"]
  },
  {
    problem: "black smoke from exhaust",
    causes: ["Excess fuel burning", "Dirty air filter"],
    solutions: ["Clean air filter", "Check fuel injector"]
  },
  {
    problem: "poor fuel mileage",
    causes: ["Dirty air filter", "Low tire pressure"],
    solutions: ["Replace air filter", "Maintain correct tire pressure"]
  },
  {
    problem: "ac not cooling",
    causes: ["Low refrigerant", "Compressor issue"],
    solutions: ["Refill refrigerant", "Check AC compressor"]
  },
  {
    problem: "steering wheel vibration",
    causes: ["Wheel alignment issue", "Worn steering components"],
    solutions: ["Perform wheel alignment", "Inspect steering system"]
  }
];

// Insert data into database
async function seedData() {
  try {
    await Problem.deleteMany(); // remove old problems
    await Problem.insertMany(problems);
    console.log("Vehicle problems inserted into database");
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();