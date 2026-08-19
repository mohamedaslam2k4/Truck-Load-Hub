import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { API_URL } from "../../api";

function AvailableLoads() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealPrices, setDealPrices] = useState({});
  const [submittingLoadId, setSubmittingLoadId] = useState(null);

  // Safe date formatting helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch available loads from backend
  const fetchAvailableLoads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/driver/available-loads`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch available loads");
      }

      setLoads(data);
    } catch (error) {
      console.error("Error fetching loads:", error);
      alert("Unable to load available loads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableLoads();
  }, []);

  // Update deal price state per load ID
  const handlePriceChange = (loadId, value) => {
    setDealPrices((previous) => ({
      ...previous,
      [loadId]: value,
    }));
  };

  // Submit deal request to backend
  const handleMakeDeal = async (load) => {
    const price = dealPrices[load.id];

    // Validate price input
    if (price === undefined || price === "") {
      alert("Please enter your deal price.");
      return;
    }
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      alert("Please enter a valid price.");
      return;
    }

    // Validate price boundaries
    if (
      numericPrice < Number(load.minPrice) ||
      numericPrice > Number(load.maxPrice)
    ) {
      alert(
        `Enter a price between ₹${Number(load.minPrice).toLocaleString("en-IN")} and ₹${Number(load.maxPrice).toLocaleString("en-IN")}`
      );
      return;
    }

    // Extract driver info safely from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("User information not found. Please login again.");
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      alert("Invalid login information. Please login again.");
      return;
    }

    const driverId = user?.id || user?.driverId || user?.userId;

    if (!driverId) {
      alert("Driver user details not found. Please login again.");
      return;
    }

    if (user.role !== "DRIVER") {
      alert("Only registered drivers can submit a deal.");
      return;
    }

    // Submit deal payload
    try {
      setSubmittingLoadId(load.id);
      const response = await fetch(`${API_URL}/driver/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loadId: load.id,
          driverId: driverId,
          dealPrice: numericPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Failed to create deal");
        return;
      }

      alert(
        `Deal request sent successfully for ${load.pickup} → ${load.destination}`
      );

      // Remove the claimed load from state
      setLoads((previousLoads) =>
        previousLoads.filter((item) => item.id !== load.id)
      );

      // Clear the input value state for this load
      setDealPrices((previousPrices) => {
        const updatedPrices = { ...previousPrices };
        delete updatedPrices[load.id];
        return updatedPrices;
      });
    } catch (error) {
      console.error("Deal error:", error);
      alert("Unable to connect to the server. Please try again.");
    } finally {
      setSubmittingLoadId(null);
    }
  };

  return (
    <div className="available-loads-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Available Loads</h1>
        <p>Find available loads and place your offer to the loader.</p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="loading">Loading available loads...</div>
      )}

      {/* EMPTY STATE */}
      {!loading && loads.length === 0 && (
        <div className="empty-state">
          <h3>No Available Loads</h3>
          <p>There are currently no available loads right now.</p>
        </div>
      )}

      {/* LOADS GRID */}
      {!loading && loads.length > 0 && (
        <div className="loads-grid">
          {loads.map((load) => (
            <Card key={load.id}>
              <div className="load-header">
                <span className="load-id">
                  Load #{String(load.id).padStart(3, "0")}
                </span>
                <div className="route">
                  <span>{load.pickup}</span>
                  <span className="arrow">→</span>
                  <span>{load.destination}</span>
                </div>
              </div>

              {/* LOAD DETAILS */}
              <div className="load-details">
                <div className="detail">
                  <span>Load Type</span>
                  <strong>{load.loadType || "N/A"}</strong>
                </div>

                <div className="detail">
                  <span>Weight</span>
                  <strong>
                    {load.weight !== null && load.weight !== undefined
                      ? `${load.weight} Tons`
                      : "N/A"}
                  </strong>
                </div>

                <div className="detail">
                  <span>Truck Type</span>
                  <strong>{load.truckType || "N/A"}</strong>
                </div>

                <div className="detail">
                  <span>Pickup Date</span>
                  <strong>{formatDate(load.pickupDate)}</strong>
                </div>
              </div>

              {/* DESCRIPTION */}
              {load.description && (
                <div className="description">
                  <span>Description</span>
                  <p>{load.description}</p>
                </div>
              )}

              {/* PRICE RANGE */}
              <div className="price-range">
                <span>Loader Price Range</span>
                <strong>
                  ₹{Number(load.minPrice || 0).toLocaleString("en-IN")} - ₹
                  {Number(load.maxPrice || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              {/* DEAL FORM SECTION */}
              <div className="deal-section">
                <label>Your Deal Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter your price"
                  value={dealPrices[load.id] ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || Number(value) >= 0) {
                      handlePriceChange(load.id, value);
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleMakeDeal(load)}
                  disabled={submittingLoadId === load.id}
                >
                  {submittingLoadId === load.id ? "Sending..." : "Make a Deal"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <style>{`
        .available-loads-page {
          width: 100%;
        }

        .page-header {
          margin-bottom: 25px;
          border-bottom: 1px solid black;
          padding-bottom: 15px;
        }

        .page-header h1 {
          margin: 0 0 6px;
          font-size: 28px;
        }

        .page-header p {
          margin: 0;
          color: #666;
        }

        .loads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 20px;
        }

        .load-header {
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }

        .load-id {
          display: inline-block;
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          background: #d2d8e5;
          padding: 4px 8px;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .route {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 19px;
          font-weight: 700;
        }

        .arrow {
          color: #777;
        }

        .load-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .detail {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail span,
        .price-range span,
        .description span {
          font-size: 13px;
          color: #777;
        }

        .detail strong {
          font-size: 15px;
        }

        .description {
          margin-bottom: 20px;
        }

        .description p {
          margin: 4px 0 0;
          font-size: 14px;
          color: #555;
          line-height: 1.5;
        }

        .price-range {
          padding: 14px;
          background: #f5f6f8;
          border-radius: 7px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .price-range strong {
          font-size: 17px;
          color: #111;
        }

        .deal-section {
          border-top: 1px solid #eee;
          padding-top: 18px;
        }

        .deal-section label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .deal-section input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 15px;
          box-sizing: border-box;
          margin-bottom: 12px;
        }

        .deal-section input:focus {
          outline: none;
          border-color: #222;
        }

        .deal-section button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 6px;
          background: #222;
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }

        .deal-section button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .deal-section button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading {
          padding: 50px 20px;
          text-align: center;
          color: #666;
        }

        .empty-state {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 60px 20px;
          text-align: center;
        }

        .empty-state h3 {
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #777;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default AvailableLoads;
