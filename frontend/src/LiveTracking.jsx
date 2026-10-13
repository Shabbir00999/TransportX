
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons in React/Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LiveTracking()
{
  function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}
  const [buses, setBuses] = useState([]);
  const [error, setError] = useState("");

  // Fetch bus data from the backend
  async function loadBuses() {
    try {
      const API = import.meta.env.VITE_API_URL || "https://transportx-1cu1.onrender.com/api";
const response = await fetch(`${API}/buses`);

      if (!response.ok) {
        throw new Error("Could not load buses");
      }

      const data = await response.json();

      // Accept the API response only when it is an array
      if (!Array.isArray(data)) {
        throw new Error("Unexpected bus data format");
      }

      console.log("Bus API data:", data);
      setBuses(data);
      setError("");
    } catch (err) {
      console.error("Error loading buses:", err);
      setError(
        "Cannot load buses. Please check that the backend is running."
      );
    }
  }

  // Load buses when the page opens and refresh every 15 seconds
  useEffect(() => {
    loadBuses();

    const interval = setInterval(() => {
      loadBuses();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Keep only buses with valid coordinates
  const validBuses = buses.filter((bus) => {
    const lat = Number(bus.lat);
    const lng = Number(bus.lng);

    return (
      bus.lat != null &&
      bus.lng != null &&
      bus.lat !== "" &&
      bus.lng !== "" &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  });

  // Center the map around the first bus, or Hyderabad by default
  const center = validBuses.length > 0
    ? [
        Number(validBuses[0].lat),
        Number(validBuses[0].lng),
      ]
    : [17.4418, 78.3489];

  return (
    <div style={{ padding: "24px" }}>
      <h2>Live Bus Tracking</h2>

      <p>Bus locations refresh every 15 seconds.</p>

      {error && (
        <p style={{ color: "crimson" }}>{error}</p>
      )}

      <div
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          marginTop: "20px",
        }}
      >
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <MapResizeFix />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {validBuses.map((bus) => (
            <Marker
              key={bus.id || bus._id}
              position={[
                Number(bus.lat),
                Number(bus.lng),
              ]}
            >
              <Popup>
                <strong>{bus.name}</strong>
                <br />
                Bus ID: {bus.id}
                <br />
                Vehicle: {bus.number}
                <br />
                Route: {bus.route}
                <br />
                Driver: {bus.driver}
                <br />
                Passengers: {bus.occupancy}/{bus.capacity}
                <br />
                ETA: {bus.eta} minutes
                <br />
                Status: {bus.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p style={{ marginTop: "16px" }}>
        Buses on map: {validBuses.length}
      </p>
    </div>
  );
}
