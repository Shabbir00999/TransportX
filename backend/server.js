require("dotenv").config();
require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Bus = require("./bus");


const app = express();

const PORT = 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    seedBuses();
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
// Middleware
app.use(cors());
app.use(express.json());


// ===============================
// BUS DATA
// ===============================

const buses = [
  {
    id: "BUS-01",
    number: "TS 09 AB 1234",
    name: "Campus Express",
    route: "Hostel → Main Campus",
    driver: "Ramesh Kumar",
    occupancy: 68,
    capacity: 50,
    eta: 5,
    status: "On Route",
    lat: 17.4418,
    lng: 78.3489
  },

  {
    id: "BUS-02",
    number: "TS 09 CD 5678",
    name: "City Connector",
    route: "Miyapur → Main Campus",
    driver: "Suresh Rao",
    occupancy: 40,
    capacity: 50,
    eta: 12,
    status: "On Route",
    lat: 17.4969,
    lng: 78.3600
  },

  {
    id: "BUS-03",
    number: "TS 09 EF 9012",
    name: "North Shuttle",
    route: "Kukatpally → Main Campus",
    driver: "Arun Singh",
    occupancy: 91,
    capacity: 50,
    eta: 18,
    status: "High Occupancy",
    lat: 17.4847,
    lng: 78.4138
  }
];
async function seedBuses() {
  try {
    const count = await Bus.countDocuments();

    if (count === 0) {
      await Bus.insertMany(buses);
      console.log("Three bus records saved to MongoDB!");
    } else {
      console.log("Bus records already exist in MongoDB.");
    }
  } catch (error) {
    console.error("Failed to seed buses:", error.message);
  }
}

// ===============================
// ALERTS
// ===============================

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "High Occupancy",
    message: "BUS-03 is above 90% occupancy."
  },

  {
    id: 2,
    type: "info",
    title: "Route Update",
    message: "BUS-02 is running normally."
  }
];


// ===============================
// ROUTES
// ===============================

const routes = [
  {
    id: "R1",
    name: "Hostel → Main Campus",
    stops: 7,
    buses: 1
  },

  {
    id: "R2",
    name: "Miyapur → Main Campus",
    stops: 9,
    buses: 1
  },

  {
    id: "R3",
    name: "Kukatpally → Main Campus",
    stops: 8,
    buses: 1
  }
];


// ===============================
// HOME API
// ===============================

app.get("/", (req, res) => {

  res.json({
    message: "Welcome to TransportX API",
    status: "Running"
  });

});


// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {

  res.json({
    success: true,
    message: "TransportX backend is running"
  });

});


// ===============================
// GET ALL BUSES
// ===============================

app.get("/api/buses", async (req, res) => {
  try {
    const liveBuses = await Bus.find().lean();
    res.json(liveBuses);
  } catch (error) {
    console.error("Failed to fetch buses:", error.message);
    res.status(500).json({ message: "Failed to fetch buses" });
  }
});
      


// ===============================
// GET SINGLE BUS
// ===============================

app.get("/api/buses/:id", (req, res) => {

  const bus = buses.find(
    (item) => item.id === req.params.id
  );

  if (!bus) {

    return res.status(404).json({
      message: "Bus not found"
    });

  }

  res.json(bus);

});


// ===============================
// GET ALERTS
// ===============================

app.get("/api/alerts", (req, res) => {

  res.json(alerts);

});


// ===============================
// GET ROUTES
// ===============================

app.get("/api/routes", (req, res) => {

  res.json(routes);

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

  console.log(
    `TransportX backend running on http://localhost:${PORT}`
  );

});