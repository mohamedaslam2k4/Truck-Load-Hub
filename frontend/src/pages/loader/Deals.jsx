import { useEffect, useState } from "react";
import Card from "../../components/Card";
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
    const confirmAccept = window.confirm("Are you sure you want to accept this deal?");
    if (!confirmAccept) return;

    try {
      setProcessingDeal(dealId);
      const response = await fetch(`${API_URL}/deals/${dealId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to accept deal");
      }

      // Re-fetch to get updated load/deal statuses
      await fetchDeals();
      alert("Deal accepted successfully");
    } catch (error) {
      console.error("Accept deal error:", error);
      alert(error.message);
    } finally {
      setProcessingDeal(null);
    }
  };

  const handleRejectDeal = async (dealId) => {
    const confirmReject = window.confirm("Are you sure you want to reject this deal?");
    if (!confirmReject) return;

    try {
      setProcessingDeal(dealId);
      const response = await fetch(`${API_URL}/deals/${dealId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to reject deal");
      }

      // Re-fetch to get updated deal status
      await fetchDeals();
      alert("Deal rejected successfully");
    } catch (error) {
      console.error("Reject deal error:", error);
      alert(error.message);
    } finally {
      setProcessingDeal(null);
    }
  };

  const handleStartTrip = async (dealId) => {
    const confirmStart = window.confirm("Are you sure you want to start this trip?");
    if (!confirmStart) return;

    try {
      setProcessingDeal(dealId);
      const response = await fetch(`${API_URL}/deals/${dealId}/start`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to start trip");
      }

      setDeals((previousDeals) =>
        previousDeals.map((deal) =>
          deal.dealId === dealId ? { ...deal, status: "IN TRANSIT" } : deal
        )
      );
      alert("Trip started successfully");
    } catch (error) {
      console.error("Start trip error:", error);
      alert(error.message);
    } finally {
      setProcessingDeal(null);
    }
  };

  const filteredDeals = filter === "ALL" 
    ? deals 
    : deals.filter((deal) => deal.status === filter);

  return (
    <div role="LOADER">
      <div className="manage-loads-page">
        <div className="page-header">
          <div>
            <h1>My Deals</h1>
            <p>Manage your load deals and driver agreements.</p>
          </div>
        </div>

        <div className="my-loads-section">
          <div className="section-header">
            <div>
              <h2>Deal History</h2>
              <p>View and manage your load agreements.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
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
                    <span className="load-id">Deal # {deal.dealId}</span>
                    <div className="route">
                      <span>{deal.pickup}</span>
                      <span className="arrow">→</span>
                      <span>{deal.destination}</span>
                    </div>
                    <span className={`status ${deal.status.toLowerCase().replace(/\s+/g, "-")}`}>
                      {deal.status}
                    </span>
                  </div>
                  <div className="driver-title">Load # {deal.loadId}</div>
                  <div className="load-details">
                    <div className="detail">
                      <strong>Load Type : </strong>
                      <span>{deal.loadType || "N/A"}</span>
                    </div>
                    <div className="detail">
                      <strong>Weight :</strong>
                      <span>{deal.weight ? `${deal.weight} Tons` : "N/A"}</span>
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

                  <div className="price">
                    <strong>Agreed Deal Price :</strong>
                    <strong>₹{Number(deal.dealPrice || 0).toLocaleString("en-IN")}</strong>
                  </div>

                  {deal.status === "PENDING" && (
                    <div className="action-button-group" style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                      <button type="button" className="create-button" onClick={() => handleAcceptDeal(deal.dealId)} disabled={processingDeal === deal.dealId}>
                        {processingDeal === deal.dealId ? "Processing..." : "Accept Deal"}
                      </button>
                      <button type="button" className="reject-action-button" onClick={() => handleRejectDeal(deal.dealId)} disabled={processingDeal === deal.dealId}>
                        {processingDeal === deal.dealId ? "Processing..." : "Reject Deal"}
                      </button>
                    </div>
                  )}

                  {deal.status === "ACCEPTED" && (
                    <button type="button" className="start-button" onClick={() => handleStartTrip(deal.dealId)} disabled={processingDeal === deal.dealId}>
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
        .status { padding: 6px 9px; border-radius: 5px; font-size: 11px; font-weight: 700; white-space: nowrap; }
        .pending { background: #fef3c7; color: #92400e; }
        .accepted { background: #dbeafe; color: #1d4ed8; }
        .in-transit { background: #e6f4ea; color: #137333; }
        .completed { background: #e8eaf6; color: #3f51b5; }
        .rejected { background: #fce8e6; color: #c5221f; }
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
        .action-button-group { display: flex; gap: 10px; width: 100%; }
        .action-button-group .create-button { flex: 1; }
        .create-button { width: 100%; padding: 13px; border: none; border-radius: 6px; background: #222; color: white; font-weight: 600; cursor: pointer; }
        .reject-action-button { flex: 1; padding: 13px; border: none; border-radius: 6px; background: #dc2626; color: white; font-weight: 600; cursor: pointer; }
        .create-button:disabled, .reject-action-button:disabled, .start-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .start-button { width: 100%; padding: 13px; border: none; border-radius: 6px; background: #29a85a; color: white; font-weight: 600; cursor: pointer; }
        .transit-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #e6f4ea; color: #137333; text-align: center; font-size: 13px; line-height: 1.5; }
        .completed-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #e8eaf6; color: #3f51b5; text-align: center; font-size: 13px; font-weight: 600; }
        .rejected-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #fce8e6; color: #c5221f; text-align: center; font-size: 13px; font-weight: 600; }
        .empty-state { grid-column: 1 / -1; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 40px; text-align: center; }
        .empty-state h3 { margin-bottom: 8px; }
        .empty-state p { margin: 0; color: #666; }
      `}</style>
    </div>
  );
}

export default Deals;
