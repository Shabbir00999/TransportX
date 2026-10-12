import LiveTracking from "./LiveTracking";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bus,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Gauge,
  LayoutDashboard,
  MapPin,
  Menu,
  Navigation,
  RefreshCw,
  Route,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";

const API = "http://localhost:5000/api";

export default function App() {
  const [buses, setBuses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [activePage, setActivePage] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  async function loadDashboard() {
    try {
      setError("");

      const responses = await Promise.all([
        fetch(`${API}/buses`),
        fetch(`${API}/alerts`),
        fetch(`${API}/routes`),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("The server returned an error.");
      }

      const [busData, alertData, routeData] = await Promise.all(
        responses.map((response) => response.json())
      );

      setBuses(busData);
      setAlerts(alertData);
      setRoutes(routeData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(
        "Cannot connect to the backend. Check that your server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    
  }, []);

  const filteredBuses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return buses.filter((bus) =>
      [bus.id, bus.number, bus.name, bus.route, bus.driver]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [buses, search]);

  const totalPassengers = buses.reduce(
    (total, bus) => total + Number(bus.occupancy || 0),
    0
  );

  const averageOccupancy = buses.length
    ? Math.round(
        buses.reduce(
          (total, bus) =>
            total +
            (bus.capacity ? (bus.occupancy / bus.capacity) * 100 : 0),
          0
        ) / buses.length
      )
    : 0;

  const highOccupancy = buses.filter(
    (bus) => bus.capacity && bus.occupancy / bus.capacity >= 0.8
  ).length;

  const navigationItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Live Buses", icon: Bus },
  { label: "Live Tracking", icon: Navigation },
  { label: "Routes", icon: Route },
  { label: "Alerts", icon: Bell },
];

  
function navigateTo(page) {
  setActivePage(page);
  setMobileMenu(false);
  setSelectedBus(null);
  setSelectedRouteId(null);
}

  

  


  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Bus size={25} />
          </div>
          <div>
            <h1>
              Transport<span>X</span>
            </h1>
            <p>SMART TRANSIT PLATFORM</p>
          </div>
          <button
            className="icon-button sidebar-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav">
          {navigationItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => navigateTo(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === "Alerts" && alerts.length > 0 && (
                <span className="nav-count">{alerts.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="ai-card">
          <div className="ai-card-icon">
            <Activity size={19} />
          </div>
          <p className="ai-eyebrow">SMART INSIGHTS</p>
          <h3>Your campus, connected.</h3>
          <p className="ai-description">
            Monitor bus occupancy and estimated arrivals from one place.
          </p>
          <div className="ai-status">
            <span className="status-dot" />
            Dashboard monitoring active
          </div>
        </div>

        <div
          className="sidebar-footer"
          role="button"
          tabIndex={0}
          title="Open Transport Admin Portal"
          onClick={() => navigateTo("Admin Portal")}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") navigateTo("Admin Portal"); }}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-avatar">TX</div>
          <div className="admin-info">
            <strong>Transport Admin</strong>
            <span>Campus operations</span>
          </div>
          <Settings size={18} className="muted-icon" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <div className="system-status">
              <span className="status-dot" />
              System online
            </div>
            <button
              className="icon-button notification-button"
              onClick={() => navigateTo("Alerts")}
              aria-label="View alerts"
            >
              <Bell size={19} />
              {alerts.length > 0 && <span className="notification-dot" />}
            </button>
            <div
              className="profile-avatar"
              role="button"
              tabIndex={0}
              title="Open Account Portal"
              onClick={() => navigateTo("Account Portal")}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") navigateTo("Account Portal"); }}
              style={{ cursor: "pointer" }}
            >A</div>
          </div>
        </header>

        <div className="page-content">
            
          <section className="welcome-section" style={{ display: activePage === "Overview" ? undefined : "none" }}>
            <div>
              <div className="eyebrow">
                <span className="live-indicator" />
                CAMPUS TRANSIT INTELLIGENCE
              </div>
              <h2>
                Your campus. <span>In motion.</span>
              </h2>
              <p>
                A smarter view of your campus transportation, all in one place.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={loadDashboard}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? "spin" : ""}
              />
              Refresh data
            </button>
          </section>

          {error && (
            <div className="error-banner">
              <AlertTriangle size={20} />
              <div>
                <strong>Connection issue</strong>
                <p>{error}</p>
              </div>
              <button onClick={loadDashboard}>Retry</button>
            </div>
          )}

          <section className="stats-grid" style={{ display: activePage === "Overview" ? undefined : "none" }}>
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Active buses</span>
                <span className="stat-icon blue">
                  <Bus size={20} />
                </span>
              </div>
              <div className="stat-value">
                {loading ? "—" : buses.length}
              </div>
              <div className="stat-foot">
                <span className="stat-positive">
                  <Activity size={14} /> Fleet overview
                </span>
                <span className="stat-muted">registered</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Passengers onboard</span>
                <span className="stat-icon purple">
                  <Users size={20} />
                </span>
              </div>
              <div className="stat-value">
                {loading ? "—" : totalPassengers}
              </div>
              <div className="stat-foot">
                <span className="stat-positive">
                  <ArrowUpRight size={14} /> Live estimate
                </span>
                <span className="stat-muted">passengers</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Average occupancy</span>
                <span className="stat-icon orange">
                  <Gauge size={20} />
                </span>
              </div>
              <div className="stat-value">
                {loading ? "—" : `${averageOccupancy}%`}
              </div>
              <div className="stat-foot">
                <span className="stat-positive">
                  <Activity size={14} /> Capacity usage
                </span>
                <span className="stat-muted">fleet average</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Capacity warnings</span>
                <span className="stat-icon red">
                  <AlertTriangle size={20} />
                </span>
              </div>
              <div className="stat-value">
                {loading ? "—" : highOccupancy}
              </div>
              <div className="stat-foot">
                <span
                  className={highOccupancy ? "stat-warning" : "stat-positive"}
                >
                  <AlertTriangle size={14} />
                  {highOccupancy ? "Needs attention" : "Within limits"}
                </span>
                <span className="stat-muted">buses</span>
              </div>
            </article>
          </section>

          <section className="section-block" id="bus-section" style={{ display: activePage === "Overview" || activePage === "Live Buses" ? undefined : "none" }}>
            <div className="section-heading">
              <div>
                <div className="section-kicker">FLEET MONITOR</div>
                <h3>Live bus overview</h3>
                <p>Track vehicles and see their latest reported status.</p>
              </div>
              <div className="updated-label">
                <span className="status-dot" />
                Updated {lastUpdated || "—"}
              </div>
            </div>

            <div className="bus-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search buses, routes or drivers..."
                  aria-label="Search buses"
                />
                {search && (
                  <button
                    className="clear-search"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button className="filter-button" onClick={loadDashboard}>
                <RefreshCw size={15} /> Update
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <RefreshCw className="spin" size={28} />
                <p>Loading campus fleet...</p>
              </div>
            ) : filteredBuses.length === 0 ? (
              <div className="empty-state">
                <Bus size={30} />
                <p>No buses match your search.</p>
              </div>
            ) : (
              <div className="bus-grid">
                {filteredBuses.map((bus) => {
                  const percentage = bus.capacity
                    ? Math.round((bus.occupancy / bus.capacity) * 100)
                    : 0;
                  const crowded = percentage >= 80;

                  return (
                    <article className="bus-card" key={bus.id}>
                      <div className="bus-card-top">
                        <div className="bus-icon-box">
                          <Bus size={23} />
                        </div>
                        <div className="bus-title">
                          <h4>{bus.name}</h4>
                          <span>
                            {bus.id} · {bus.number}
                          </span>
                        </div>
                        <span
                          className={`bus-status ${
                            crowded ? "warning" : "normal"
                          }`}
                        >
                          <span className="status-dot" />
                          {crowded ? "High occupancy" : bus.status}
                        </span>
                      </div>

                      <div className="bus-route">
                        <MapPin size={17} />
                        <span>{bus.route}</span>
                      </div>

                      <div className="bus-metrics">
                        <div>
                          <span className="metric-label">Est. arrival</span>
                          <strong className="eta-value">
                            {bus.eta} <small>min</small>
                          </strong>
                        </div>
                        <div>
                          <span className="metric-label">Passengers</span>
                          <strong>
                            {bus.occupancy}
                            <small> / {bus.capacity}</small>
                          </strong>
                        </div>
                        <div>
                          <span className="metric-label">Occupancy</span>
                          <strong>{percentage}%</strong>
                        </div>
                      </div>

                      <div className="occupancy-track">
                        <div
                          className={`occupancy-fill ${
                            crowded ? "crowded" : ""
                          }`}
                          style={{
                            width: `${Math.min(100, percentage)}%`,
                          }}
                        />
                      </div>

                      <div className="bus-card-bottom">
                        <span>Driver: {bus.driver}</span>
                        <button onClick={() => setSelectedBus(bus)}>
                          View details <Navigation size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
          <section
  className="section-block"
  style={{
    display: activePage === "Live Tracking" ? undefined : "none",
  }}
>
  <LiveTracking />
</section>

          <section className="lower-grid" style={{ display: ["Overview", "Routes", "Alerts"].includes(activePage) ? undefined : "none", gridTemplateColumns: activePage === "Routes" || activePage === "Alerts" ? "minmax(0, 1fr)" : undefined }}>
            <div className="panel" id="routes-section" style={{ display: activePage === "Overview" || activePage === "Routes" ? undefined : "none" }}>
              <div className="panel-heading">
                <div>
                  <div className="section-kicker">NETWORK</div>
                  <h3>Campus routes</h3>
                </div>
                <Route size={21} className="panel-heading-icon" />
              </div>

              <div className="routes-list">
                {routes.map((route, index) => {
                  const routeIsOpen = selectedRouteId === route.id;
                  const routeBuses = buses.filter((bus) => {
                    const busRoute = String(bus.route || "").toLowerCase();
                    const routeName = String(route.name || "").toLowerCase();
                    return busRoute.includes(routeName) || routeName.includes(busRoute) && busRoute.length > 0;
                  });

                  return (
                    <div key={route.id}>
                      <button
                        type="button"
                        className="route-row"
                        onClick={() => setSelectedRouteId(routeIsOpen ? null : route.id)}
                        aria-expanded={routeIsOpen}
                        style={{ width: "100%", textAlign: "left", border: 0, cursor: "pointer", background: "transparent", font: "inherit" }}
                      >
                        <div className={`route-number route-color-${index % 3}`}>
                          R{index + 1}
                        </div>
                        <div className="route-info">
                          <strong>{route.name}</strong>
                          <span>{route.stops} stops · {route.buses} bus</span>
                        </div>
                        <ChevronDown
                          size={17}
                          className="route-arrow"
                          style={{ transform: routeIsOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 180ms ease" }}
                        />
                      </button>
                      {routeIsOpen && (
                        <div style={{ padding: "12px 16px 16px 62px", borderBottom: "1px solid #e7ebf3", background: "#fafbff" }}>
                          <strong style={{ display: "block", marginBottom: 8 }}>Route details</strong>
                          <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: 13 }}>Route: {route.name}</p>
                          <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: 13 }}>Stops: {route.stops} · Buses assigned: {route.buses}</p>
                          {routeBuses.length > 0 ? (
                            <div style={{ display: "grid", gap: 6 }}>
                              {routeBuses.map((bus) => (
                                <button key={bus.id} type="button" onClick={() => setSelectedBus(bus)} style={{ border: "1px solid #e1e7f0", borderRadius: 8, background: "white", padding: "9px 10px", textAlign: "left", cursor: "pointer", color: "inherit" }}>
                                  <strong>{bus.number} · {bus.name}</strong>
                                  <span style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 3 }}>ETA {bus.eta} min · {bus.occupancy}/{bus.capacity} passengers · Click for bus details</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>No bus is directly matched to this route name in the current demo data.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!loading && routes.length === 0 && (
                  <p className="muted-message">No routes available.</p>
                )}
              </div>
            </div>

            <div className="panel" id="alerts-section" style={{ display: activePage === "Overview" || activePage === "Alerts" ? undefined : "none" }}>
              <div className="panel-heading">
                <div>
                  <div className="section-kicker">SYSTEM NOTIFICATIONS</div>
                  <h3>Recent alerts</h3>
                </div>
                <Bell size={21} className="panel-heading-icon" />
              </div>

              <div className="alerts-list">
                {alerts.map((alert) => (
                  <div className="alert-row" key={alert.id}>
                    <div
                      className={`alert-icon ${
                        alert.type === "warning"
                          ? "alert-warning"
                          : "alert-info"
                      }`}
                    >
                      {alert.type === "warning" ? (
                        <AlertTriangle size={18} />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                    </div>
                    <div className="alert-content">
                      <strong>{alert.title}</strong>
                      <p>{alert.message}</p>
                    </div>
                    <span className="alert-live-dot" />
                  </div>
                ))}
                {!loading && alerts.length === 0 && (
                  <div className="no-alerts">
                    <CheckCircle2 size={25} />
                    <p>All quiet. No active alerts.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {activePage === "Admin Portal" && (
            <section className="standalone-page" style={{ display: "grid", gap: 18 }}>
              <div>
                <div className="section-kicker">ADMINISTRATION</div>
                <h2 style={{ margin: "8px 0" }}>Transport Admin Portal</h2>
                <p style={{ color: "#64748b", margin: 0 }}>Manage the demo campus transport overview from one place.</p>
              </div>
              <div className="stats-grid">
                <article className="stat-card"><span className="stat-label">Registered buses</span><div className="stat-value">{buses.length}</div></article>
                <article className="stat-card"><span className="stat-label">Campus routes</span><div className="stat-value">{routes.length}</div></article>
                <article className="stat-card"><span className="stat-label">Current alerts</span><div className="stat-value">{alerts.length}</div></article>
              </div>
              <div className="panel" style={{ padding: 22 }}>
                <h3 style={{ marginTop: 0 }}>Admin quick actions</h3>
                <p style={{ color: "#64748b" }}>These controls open the existing demo data views. User management, permissions, and saved admin changes require backend features that are not currently implemented.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="filter-button" onClick={() => navigateTo("Live Buses")}>Manage buses</button>
                  <button className="filter-button" onClick={() => navigateTo("Routes")}>View routes</button>
                  <button className="filter-button" onClick={() => navigateTo("Alerts")}>Review alerts</button>
                  <button className="filter-button" onClick={loadDashboard}>Refresh system data</button>
                </div>
              </div>
            </section>
          )}

          {activePage === "Account Portal" && (
            <section className="standalone-page" style={{ display: "grid", gap: 18 }}>
              <div>
                <div className="section-kicker">PROFILE & SETTINGS</div>
                <h2 style={{ margin: "8px 0" }}>Account Portal</h2>
                <p style={{ color: "#64748b", margin: 0 }}>Your current demo account information.</p>
              </div>
              <div className="panel" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div className="profile-avatar" style={{ width: 58, height: 58, display: "grid", placeItems: "center", fontSize: 22 }}>A</div>
                <div>
                  <h3 style={{ margin: "0 0 5px" }}>Transport Admin</h3>
                  <p style={{ margin: 0, color: "#64748b" }}>Role: Administrator · Account type: Demo</p>
                </div>
              </div>
              <div className="panel" style={{ padding: 22 }}>
                <h3 style={{ marginTop: 0 }}>Account settings</h3>
                <p style={{ color: "#64748b" }}>Sign-in, password changes, and persistent profile editing are not connected yet. This page is a front-end demo and does not change login credentials.</p>
                <button className="filter-button" onClick={() => navigateTo("Overview")}>Return to Overview</button>
              </div>
            </section>
          )}

          <footer className="page-footer" style={{ display: activePage === "Overview" ? undefined : "none" }}>
            <div className="footer-brand">
              <Bus size={17} />
              <strong>TransportX</strong>
              <span>Smarter journeys start here.</span>
            </div>
            <span>Campus transit dashboard · Demo data</span>
          </footer>
        </div>
      </main>

      {selectedBus && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedBus(null)}
          role="presentation"
        >
          <div
            className="bus-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div className="bus-icon-box">
                <Bus size={23} />
              </div>
              <div className="modal-title">
                <h3 id="modal-title">{selectedBus.name}</h3>
                <p>
                  {selectedBus.id} · {selectedBus.number}
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedBus(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-route">
              <Route size={18} />
              <span>{selectedBus.route}</span>
            </div>

            <div className="modal-stats">
              <div>
                <span>Arrival estimate</span>
                <strong>{selectedBus.eta} min</strong>
              </div>
              <div>
                <span>Passengers</span>
                <strong>
                  {selectedBus.occupancy}/{selectedBus.capacity}
                </strong>
              </div>
              <div>
                <span>Driver</span>
                <strong>{selectedBus.driver}</strong>
              </div>
              <div>
                <span>Bus status</span>
                <strong>{selectedBus.status}</strong>
              </div>
            </div>

            <div className="modal-location">
              <MapPin size={20} />
              <div>
                <strong>Last reported location</strong>
                <p>
                  Latitude: {selectedBus.lat} · Longitude: {selectedBus.lng}
                </p>
              </div>
            </div>

            <p className="modal-note">
              Location and arrival information use demonstration data. A real
              GPS device is needed for actual live tracking.
            </p>
            <button
              className="modal-done"
              onClick={() => setSelectedBus(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
