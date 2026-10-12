
const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  number: { type: String, required: true },
  name: { type: String, required: true },
  route: { type: String, required: true },
  driver: { type: String, required: true },
  occupancy: { type: Number, required: true },
  capacity: { type: Number, required: true },
  eta: { type: Number, required: true },
  status: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

module.exports = mongoose.model("Bus", busSchema);
