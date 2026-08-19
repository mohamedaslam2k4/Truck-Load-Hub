import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { API_URL } from "../../api";

function MyDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [completingDeal, setCompletingDeal] = useState(null);

  // Safely extract driver details from localStorage (supports multiple user object schemas)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : {};
  const driverId = user?.id || user?.driverId || user?.userId;

  // Format date string safely to DD/MM/YYYY format
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

  // Fetch driver deals
  const fetchDeals = async () => {
    if (!driverId) {
      console.error("Driver ID missing. User payload in localStorage:", user);
      alert("Driver information not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/deals/driver/${driverId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch deals");
      }
      setDeals(data);
    } catch (error) {
      console.error("Error fetching deals:", error);
      alert(`Unable to load your deals: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [driverId]);

  // COMPLETE TRIP: IN TRANSIT → COMPLETED
  const handleComplete = async (dealId) => {
    const confirmComplete = window.confirm(
      "Are you sure you want to mark this trip as completed?"
    );
    if (!confirmComplete) return;

    try {
      setCompletingDeal(dealId);
      const response = await fetch(`${API_URL}/deals/${dealId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to complete trip");
      }

      setDeals((previousDeals) =>
        previousDeals.map((deal) =>
          deal.dealId === dealId ? { ...deal, status: "COMPLETED" } : deal
        )
      );
      alert("Trip completed successfully");
    } catch (error) {
      console.error("Complete deal error:", error);
      alert(error.message || "Unable to complete trip");
    } finally {
      setCompletingDeal(null);
    }
  };

  const filteredDeals =
    filter === "ALL"
      ? deals
      : deals.filter((deal) => deal.status === filter);

  return (
    <div role="DRIVER">
      <div className="manage-loads-page">
        <div className="page-header">
          <div>
            <h1>My Deals</h1>
            <p>View and manage the loads you have claimed.</p>
          </div>
        </div>

        <div className="my-loads-section">
          <div className="section-header">
            <div>
              <h2>Claimed Agreements</h2>
              <p>Track your ongoing and completed driver trips.</p>
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

          <div className="loads-grid">
            {loading ? (
              <p>Loading your deals...</p>
            ) : filteredDeals.length === 0 ? (
              <div className="empty-state">
                <h3>No Deals Found</h3>
                <p>No deals match the selected filter criteria.</p>
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <Card key={deal.dealId}>
                  <div className="load-header">
                    <span className="load-id">
                      Deal # DL-{String(deal.dealId).padStart(3, "0")}
                    </span>
                    <div className="route">
                      <span>{deal.pickup}</span>
                      <span className="arrow">→</span>
                      <span>{deal.destination}</span>
                    </div>
                    <span
                      className={`status ${deal.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {deal.status}
                    </span>
                  </div>

                  <div className="load-details">
                    <div className="detail">
                      <strong>Load ID :</strong>
                      <span>{deal.loadId ? `#${deal.loadId}` : "N/A"}</span>
                    </div>
                    <div className="detail">
                      <strong>Load Type :</strong>
                      <span>{deal.loadType || "N/A"}</span>
                    </div>
                    <div className="detail">
                      <strong>Weight :</strong>
                      <span>
                        {deal.weight !== null && deal.weight !== undefined
                          ? `${deal.weight} Tons`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="detail">
                      <strong>Truck Type :</strong>
                      <span>{deal.truckType || "N/A"}</span>
                    </div>
                    <div className="detail">
                      <strong>Pickup Date :</strong>
                      <span>{formatDate(deal.pickupDate)}</span>
                    </div>
                  </div>

                  {/* LOADER INFORMATION CARD */}
                  <div className="driver-info">
                    <div className="info-column">
                      <div className="driver-title">Loader Details</div>
                      <div className="driver-row">
                        <span>Name:</span>
                        <strong>{deal.loaderName || "N/A"}</strong>
                      </div>
                      <div className="driver-row">
                        <span>Phone No:</span>
                        <strong>{deal.loaderPhone || "N/A"}</strong>
                      </div>
                    </div>

                    <div className="info-column">
                      <div className="driver-title">Location / ID</div>
                      <div className="driver-row">
                        <span>City:</span>
                        <strong>{deal.loaderCity || "N/A"}</strong>
                      </div>
                      <div className="driver-row">
                        <span>Loader ID:</span>
                        <strong>
                          {deal.loaderId
                            ? `LOD-${String(deal.loaderId).padStart(3, "0")}`
                            : "N/A"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="price">
                    <strong>Your Agreed Deal Price :</strong>
                    <strong>
                      ₹{Number(deal.dealPrice || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  {deal.status === "PENDING" && (
                    <div className="pending-message">
                      Waiting for loader confirmation.
                    </div>
                  )}

                  {deal.status === "ACCEPTED" && (
                    <div className="accepted-message">
                      Deal accepted by loader.<br />
                      Waiting for trip to start.
                    </div>
                  )}

                  {deal.status === "IN TRANSIT" && (
                    <button
                      type="button"
                      className="complete-button"
                      onClick={() => handleComplete(deal.dealId)}
                      disabled={completingDeal === deal.dealId}
                    >
                      {completingDeal === deal.dealId
                        ? "Completing..."
                        : "Complete Trip"}
                    </button>
                  )}

                  {deal.status === "COMPLETED" && (
                    <div className="completed-message">✓ Trip Completed</div>
                  )}

                  {deal.status === "REJECTED" && (
                    <div className="rejected-message">Deal Rejected</div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .manage-loads-page { width: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding-bottom: 15px; border-bottom: 1px solid black; }
        .page-header h1 { margin: 0 0 6px; font-size: 28px; }
        .page-header p { margin: 0; color: #666; }
        .load-id { display: block; color: #6b7280; font-size: 12px; font-weight: 600; background: #d2d8e5; padding: 6px 9px; border-radius: 5px; }
        .my-loads-section { margin-top: 10px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-header h2 { margin: 0 0 5px; font-size: 22px; }
        .section-header p { margin: 0; color: #666; }
        .filter-select { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; background: #fff; font-size: 14px; cursor: pointer; }
        .load-count { padding: 7px 12px; background: #eee; border: 1px solid #a9a8a8; border-radius: 5px; font-size: 13px; font-weight: 600; }
        .loads-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; }
        .load-header { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid black; }
        .route { display: flex; align-items: center; gap: 9px; font-size: 19px; font-weight: 700; }
        .arrow { color: #777; }
        .status { padding: 6px 9px; border-radius: 5px; font-size: 11px; font-weight: 700; white-space: nowrap; text-transform: uppercase; }
        .pending { background: #fef3c7; color: #92400e; }
        .accepted { background: #dbeafe; color: #1d4ed8; }
        .in-transit { background: #dcfce7; color: #166534; }
        .completed { background: #e0e7ff; color: #3730a3; }
        .rejected { background: #fee2e2; color: #991b1b; }
        .load-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }
        .detail { display: flex; align-items: center; gap: 5px; }
        .detail span { font-size: 13px; color: #777; }
        .detail strong { font-size: 15px; }
        .driver-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 15px; background: #f5f6f8; border-radius: 7px; margin-bottom: 10px; }
        .info-column:first-child { padding-right: 12px; border-right: 1px solid #e0e0e0; }
        .driver-title { font-size: 14px; font-weight: 700; margin-bottom: 10px; color: #222; text-decoration: underline; }
        .driver-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; }
        .driver-row:last-child { margin-bottom: 0; }
        .driver-row span { color: #666; font-size: 12px; }
        .driver-row strong { font-size: 13px; text-align: right; color: #111; }
        .price { display: flex; justify-content: space-evenly; align-items: center; padding: 14px 0; border-radius: 6px; border: 1px solid #e2e2e2; margin-bottom: 15px; background: #e7efff; }
        .price strong { font-size: 17px; }
        .complete-button { width: 100%; padding: 13px; border: none; border-radius: 6px; background: #222; color: white; font-weight: 600; cursor: pointer; font-size: 14px; }
        .complete-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .pending-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #fef3c7; color: #92400e; text-align: center; font-size: 13px; font-weight: 600; }
        .accepted-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #dbeafe; color: #1d4ed8; text-align: center; font-size: 13px; font-weight: 600; line-height: 1.4; }
        .completed-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #e0e7ff; color: #3730a3; text-align: center; font-size: 13px; font-weight: 600; }
        .rejected-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #fee2e2; color: #991b1b; text-align: center; font-size: 13px; font-weight: 600; }
        .empty-state { grid-column: 1 / -1; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 40px; text-align: center; }
        .empty-state h3 { margin-bottom: 8px; }
        .empty-state p { margin: 0; color: #666; }
      `}</style>
    </div>
  );
}

export default MyDeals;
