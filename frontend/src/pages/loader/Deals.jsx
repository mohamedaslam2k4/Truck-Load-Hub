import { useEffect, useState } from "react";
import { API_URL } from "../../api";

function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [processingDeal, setProcessingDeal] = useState(null);

  // Safely extract loader details from localStorage (supports multiple user object schemas)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : {};
  const loaderId = user?.id || user?.loaderId || user?.userId;

  // Format date string to DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const fetchDeals = async () => {
    if (!loaderId) {
      console.error("Loader ID missing. User payload in localStorage:", user);
      alert("Loader information not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/deals/loader/${loaderId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error("Error fetching deals:", error);
      alert(`Unable to load deals: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [loaderId]);

  const handleAcceptDeal = async (dealId) => {
    if (!window.confirm("Are you sure you want to accept this deal?")) return;

    try {
      setProcessingDeal(dealId);
      const response = await fetch(`${API_URL}/deals/${dealId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to accept deal");

      // Optimistic UI update + sync with backend
      setDeals((prev) =>
        prev.map((d) => (d.dealId === dealId ? { ...d, status: "ACCEPTED" } : d))
      );
      alert("Deal accepted successfully");
    } catch (error) {
      console.error("Accept deal error:", error);
      alert(error.message);
    } finally {
      setProcessingDeal(null);
    }
  };

  const handleRejectDeal = async (dealId) => {
    if (!window.confirm("Are you sure you want to reject this deal?")) return;

    try {
      setProcessingDeal(dealId);
      const response = await fetch(`${API_URL}/deals/${dealId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to reject deal");

      setDeals((prev) =>
        prev.map((d) => (d.dealId === dealId ? { ...d, status: "REJECTED" } : d))
      );
      alert("Deal rejected successfully");
    } catch (error) {
      console.error("Reject deal error:", error);
      alert(error.message);
    } finally {
      setProcessingDeal(null);
    }
  };

  const handleStartTrip = async (dealId) => {
    if (!window.confirm("Are you sure you want to start this trip?")) return;

    try {
      setProcessingDeal(dealId);
      const response = await fetch(`${API_URL}/deals/${dealId}/start`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to start trip");

      setDeals((prev) =>
        prev.map((d) => (d.dealId === dealId ? { ...d, status: "IN TRANSIT" } : d))
      );
      alert("Trip started successfully");
    } catch (error) {
      console.error("Start trip error:", error);
      alert(error.message);
    } finally {
      setProcessingDeal(null);
    }
  };

  const filteredDeals =
    filter === "ALL" ? deals : deals.filter((deal) => deal.status === filter);

  return (
    <div className="deals-page" role="LOADER">
      <div className="page-header">
        <div>
          <h1>My Deals</h1>
          <p>Manage your load deals and driver agreements.</p>
        </div>
      </div>

      <div className="deals-card">
        <div className="card-header">
          <div>
            <h2>Deal History</h2>
            <p>View and manage your load agreements.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Deals</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN TRANSIT">In Transit</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <span className="load-count">{filteredDeals.length} Deals</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading your deals...</div>
        ) : filteredDeals.length === 0 ? (
          <div className="empty-state">
            <h3>No Deals Found</h3>
            <p>No deals match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="deals-grid">
            {filteredDeals.map((deal) => (
              <div className="deal-card" key={deal.dealId}>
                <div className="deal-header">
                  <div>
                    <span className="deal-id">Deal #{deal.dealId}</span>
                    <div className="route">
                      <span>{deal.pickup}</span>
                      <span className="arrow">→</span>
                      <span>{deal.destination}</span>
                    </div>
                  </div>
                  <span className={`status ${deal.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {deal.status}
                  </span>
                </div>

                <div className="deal-details">
                  <div className="detail">
                    <span>Load Type:</span>
                    <strong>{deal.loadType || "N/A"}</strong>
                  </div>
                  <div className="detail">
                    <span>Weight:</span>
                    <strong>{deal.weight ? `${deal.weight} Tons` : "N/A"}</strong>
                  </div>
                  <div className="detail">
                    <span>Truck Type:</span>
                    <strong>{deal.truckType || "N/A"}</strong>
                  </div>
                  <div className="detail">
                    <span>Pickup Date:</span>
                    <strong>{formatDate(deal.pickupDate)}</strong>
                  </div>
                </div>

                {/* DRIVER & TRUCK DETAILS 2-COLUMN GRID */}
                <div className="driver-info">
                  <div className="info-column">
                    <div className="driver-title">Driver Details</div>
                    <div className="driver-row">
                      <span>Name:</span>
                      <strong>{deal.driverName || "N/A"}</strong>
                    </div>
                    <div className="driver-row">
                      <span>Phone No:</span>
                      <strong>{deal.driverPhone || "N/A"}</strong>
                    </div>
                    <div className="driver-row">
                      <span>City:</span>
                      <strong>{deal.driverCity || "N/A"}</strong>
                    </div>
                    <div className="driver-row">
                      <span>Experience:</span>
                      <strong>{deal.experience ? `${deal.experience} Yrs` : "N/A"}</strong>
                    </div>
                  </div>

                  <div className="info-column">
                    <div className="driver-title">Truck Details</div>
                    <div className="driver-row">
                      <span>License No:</span>
                      <strong>{deal.licenseNo || deal.licenseNumber || "N/A"}</strong>
                    </div>
                    <div className="driver-row">
                      <span>Truck No:</span>
                      <strong>{deal.vehicleNumber || "N/A"}</strong>
                    </div>
                    <div className="driver-row">
                      <span>Truck Type:</span>
                      <strong>{deal.vehicleType || "N/A"}</strong>
                    </div>
                    <div className="driver-row">
                      <span>Capacity:</span>
                      <strong>{deal.capacity ? `${deal.capacity} Tons` : "N/A"}</strong>
                    </div>
                  </div>
                </div>

                <div className="deal-price">
                  <span>Agreed Deal Price:</span>
                  <strong>₹{Number(deal.dealPrice || 0).toLocaleString("en-IN")}</strong>
                </div>

                {/* ACTION BUTTONS */}
                {deal.status === "PENDING" && (
                  <div className="action-button-group">
                    <button
                      type="button"
                      className="accept-button"
                      onClick={() => handleAcceptDeal(deal.dealId)}
                      disabled={processingDeal === deal.dealId}
                    >
                      {processingDeal === deal.dealId ? "Processing..." : "Accept Deal"}
                    </button>
                    <button
                      type="button"
                      className="reject-button"
                      onClick={() => handleRejectDeal(deal.dealId)}
                      disabled={processingDeal === deal.dealId}
                    >
                      {processingDeal === deal.dealId ? "Processing..." : "Reject Deal"}
                    </button>
                  </div>
                )}

                {deal.status === "ACCEPTED" && (
                  <button
                    type="button"
                    className="start-button"
                    onClick={() => handleStartTrip(deal.dealId)}
                    disabled={processingDeal === deal.dealId}
                  >
                    {processingDeal === deal.dealId ? "Starting..." : "Start Trip"}
                  </button>
                )}

                {deal.status === "IN TRANSIT" && (
                  <div className="transit-message">
                    Trip is currently <strong>In Transit</strong>.<br />
                    Driver can complete the trip after delivery.
                  </div>
                )}

                {deal.status === "COMPLETED" && (
                  <div className="completed-message">Load Delivered</div>
                )}

                {deal.status === "REJECTED" && (
                  <div className="rejected-message">Deal Rejected</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .deals-page { padding: 24px; width: 100%; box-sizing: border-box; }
        .page-header { margin-bottom: 24px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; }
        .page-header h1 { margin: 0 0 6px; font-size: 28px; font-weight: 700; }
        .page-header p { margin: 0; color: #6b7280; font-size: 14px; }
        .deals-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
        .card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb; }
        .card-header h2 { margin: 0 0 5px; font-size: 20px; }
        .card-header p { margin: 0; color: #6b7280; font-size: 13px; }
        .filter-select { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; background: #fff; font-size: 14px; cursor: pointer; }
        .load-count { padding: 7px 12px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 5px; font-size: 13px; font-weight: 600; }
        .deals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; padding: 20px; }
        .deal-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .deal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px solid #eee; }
        .deal-id { display: inline-block; color: #4b5563; font-size: 12px; font-weight: 600; background: #e5e7eb; padding: 4px 8px; border-radius: 4px; margin-bottom: 6px; }
        .route { display: flex; align-items: center; gap: 9px; font-size: 18px; font-weight: 700; }
        .arrow { color: #777; }
        .status { padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; text-transform: uppercase; }
        .pending { background: #fef3c7; color: #92400e; }
        .accepted { background: #dbeafe; color: #1d4ed8; }
        .in-transit { background: #dcfce7; color: #166534; }
        .completed { background: #e0e7ff; color: #3730a3; }
        .rejected { background: #fee2e2; color: #991b1b; }
        .deal-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px; }
        .detail { display: flex; flex-direction: column; gap: 2px; }
        .detail span { font-size: 12px; color: #6b7280; }
        .detail strong { font-size: 14px; color: #111827; }
        .driver-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; margin-bottom: 15px; }
        .info-column:first-child { padding-right: 12px; border-right: 1px solid #e5e7eb; }
        .driver-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; color: #111827; text-decoration: underline; }
        .driver-row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 5px; }
        .driver-row:last-child { margin-bottom: 0; }
        .driver-row span { color: #6b7280; font-size: 12px; }
        .driver-row strong { font-size: 12px; color: #111827; text-align: right; }
        .deal-price { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-radius: 6px; border: 1px solid #bfdbfe; margin-bottom: 15px; background: #eff6ff; }
        .deal-price span { color: #1e40af; font-size: 13px; font-weight: 600; }
        .deal-price strong { font-size: 18px; color: #1e3a8a; }
        .action-button-group { display: flex; gap: 10px; width: 100%; }
        .accept-button, .reject-button, .start-button { padding: 11px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: opacity 0.2s; }
        .accept-button { flex: 1; background: #111827; color: white; }
        .reject-button { flex: 1; background: #dc2626; color: white; }
        .start-button { width: 100%; background: #16a34a; color: white; }
        .accept-button:disabled, .reject-button:disabled, .start-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .transit-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #dcfce7; color: #166534; text-align: center; font-size: 13px; line-height: 1.5; }
        .completed-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #e0e7ff; color: #3730a3; text-align: center; font-size: 13px; font-weight: 600; }
        .rejected-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #fee2e2; color: #991b1b; text-align: center; font-size: 13px; font-weight: 600; }
        .loading-state, .empty-state { padding: 50px; text-align: center; color: #6b7280; }
        .empty-state h3 { margin: 0 0 8px; color: #111827; }
        .empty-state p { margin: 0; }
      `}</style>
    </div>
  );
}

export default Deals;
