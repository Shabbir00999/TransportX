require("dotenv").config();
require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Bus = require("./bus");


const app = express();

const PORT = process.env.PORT || 5000;
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
      
/* ===============================
   ADMIN BUS MANAGEMENT API
================================ */

// ADD A BUS
app.post("/api/buses", async (req, res) => {
  try {
    const {
      id,
      number,
      name,
      route,
      driver,
      occupancy,
      capacity,
      eta,
      status,
      lat,
      lng
    } = req.body;

    if (!id || !number || !name || !route || !driver || !status) {
      return res.status(400).json({
        message: "Please provide the bus ID, number, name, route, driver and status."
      });
    }

    const parsedCapacity = Number(capacity);
    const parsedOccupancy = Number(occupancy ?? 0);
    const parsedEta = Number(eta ?? 0);

    if (
      !Number.isFinite(parsedCapacity) ||
      parsedCapacity <= 0 ||
      !Number.isFinite(parsedOccupancy) ||
      parsedOccupancy < 0 ||
      parsedOccupancy > parsedCapacity ||
      !Number.isFinite(parsedEta) ||
      parsedEta < 0
    ) {
      return res.status(400).json({
        message: "Capacity must be positive, occupancy must be between zero and capacity, and ETA cannot be negative."
      });
    }

    const existingBus = await Bus.findOne({
      $or: [{ id }, { number }]
    });

    if (existingBus) {
      return res.status(409).json({
        message: "A bus with this ID or registration number already exists."
      });
    }

    const newBus = await Bus.create({
      id: String(id).trim(),
      number: String(number).trim(),
      name: String(name).trim(),
      route: String(route).trim(),
      driver: String(driver).trim(),
      occupancy: parsedOccupancy,
      capacity: parsedCapacity,
      eta: parsedEta,
      status: String(status).trim(),
      lat: Number(lat ?? 0),
      lng: Number(lng ?? 0)
    });

    res.status(201).json({
      message: "Bus added successfully.",
      bus: newBus
    });
  } catch (error) {
    console.error("Add bus failed:", error.message);
    res.status(500).json({ message: "Failed to add bus." });
  }
});


// EDIT A BUS
app.put("/api/buses/:id", async (req, res) => {
  try {
    const allowedFields = [
      "number",
      "name",
      "route",
      "driver",
      "occupancy",
      "capacity",
      "eta",
      "status",
      "lat",
      "lng"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No editable bus details were provided."
      });
    }

    for (const field of ["number", "name", "route", "driver", "status"]) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "string" ||
          !updates[field].trim()
        ) {
          return res.status(400).json({
            message: `${field} must be a non-empty string.`
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    for (const field of ["occupancy", "capacity", "eta", "lat", "lng"]) {
      if (updates[field] !== undefined) {
        updates[field] = Number(updates[field]);

        if (!Number.isFinite(updates[field])) {
          return res.status(400).json({
            message: `${field} must be a valid number.`
          });
        }
      }
    }

    const currentBus = await Bus.findOne({ id: req.params.id });

    if (!currentBus) {
      return res.status(404).json({ message: "Bus not found." });
    }

    const finalCapacity = updates.capacity ?? currentBus.capacity;
    const finalOccupancy = updates.occupancy ?? currentBus.occupancy;
    const finalEta = updates.eta ?? currentBus.eta;

    if (
      finalCapacity <= 0 ||
      finalOccupancy < 0 ||
      finalOccupancy > finalCapacity ||
      finalEta < 0
    ) {
      return res.status(400).json({
        message: "Check capacity, occupancy and ETA values."
      });
    }

    if (updates.number !== undefined) {
      const duplicate = await Bus.findOne({
        number: updates.number,
        id: { $ne: req.params.id }
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Another bus already uses this registration number."
        });
      }
    }

    Object.assign(currentBus, updates);
    await currentBus.save();

    res.json({
      message: "Bus updated successfully.",
      bus: currentBus
    });
  } catch (error) {
    console.error("Update bus failed:", error.message);
    res.status(500).json({ message: "Failed to update bus." });
  }
});


// DELETE A BUS
app.delete("/api/buses/:id", async (req, res) => {
  try {
    const deletedBus = await Bus.findOneAndDelete({
      id: req.params.id
    });

    if (!deletedBus) {
      return res.status(404).json({ message: "Bus not found." });
    }

    res.json({
      message: "Bus deleted successfully.",
      id: deletedBus.id
    });
  } catch (error) {
    console.error("Delete bus failed:", error.message);
    res.status(500).json({ message: "Failed to delete bus." });
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