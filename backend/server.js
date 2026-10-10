const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

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
    occupancy: 42,
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

app.get("/api/buses", (req, res) => {

  const liveBuses = buses.map((bus) => {

    // Simulate changing occupancy
    const randomOccupancy =
      bus.occupancy +
      Math.floor(Math.random() * 5) -
      2;

    // Simulate changing ETA
    const randomEta =
      bus.eta +
      Math.floor(Math.random() * 3) -
      1;

    return {

      ...bus,

      occupancy: Math.min(
        bus.capacity,
        Math.max(0, randomOccupancy)
      ),

      eta: Math.max(
        1,
        randomEta
      )

    };

  });

  res.json(liveBuses);

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