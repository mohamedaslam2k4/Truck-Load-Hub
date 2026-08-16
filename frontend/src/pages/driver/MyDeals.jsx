import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { API_URL } from "../../api"; 


function MyDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingDeal, setCompletingDeal] = useState(null);

  // get logined user
  const user = JSON.parse(localStorage.getItem("user"));

  // fetch driver deals
  const fetchDeals = async () => {
    if (!user || !user.id) {
      alert("User information not found. Please login again.");
      setLoading(false); return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/deals/driver/${user.id}`);
      const data = await response.json(); if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch deals");
      } setDeals(data);
    }
    catch (error) { console.error("Error fetching deals:", error); alert("Unable to load your deals"); }
    finally { setLoading(false); }
  };

  // load deals when loader open dashbaord
  useEffect(() => {
    fetchDeals();
  }, []);

  // COMPLETE TRIP: IN TRANSIT → COMPLETED
  const handleComplete = async (dealId) => {
    const confirmComplete = window.confirm("Are you sure you want to mark this trip as completed?");
    if (!confirmComplete) return; try {
      setCompletingDeal(dealId);
      const response = await fetch(`${API_URL}/deals/${dealId}/complete`, {method: "PUT", headers: { "Content-Type": "application/json" },});

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to complete trip");
      }
      setDeals((previousDeals) => previousDeals.map((deal) => deal.dealId === dealId ? { ...deal, status: "COMPLETED" } : deal));
      alert("Trip completed successfully");
    }
    catch (error) {
      console.error("Complete deal error:", error);
      alert(error.message || "Unable to complete trip");
    }
    finally { setCompletingDeal(null); }
  };

  //loading state 
  if (loading) {
    return (
      <div className="my-deals-page">
        <div className="page-header">
          <h1>My Deals</h1>
          <p>View and manage the loads you have claimed.</p>
        </div>
        <div className="loading">Loading your deals...</div>
        <style>{`
          .my-deals-page { width: 100%; }
          .page-header { margin-bottom: 25px; }
          .page-header h1 { margin: 0 0 6px; font-size: 28px; }
          .page-header p { margin: 0; color: #666; }
          .loading { padding: 50px 20px; text-align: center; color: #666; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="my-deals-page">
      <div className="page-header">
        <h1>My Deals</h1>
        <p>View and manage the loads you have claimed.</p>
      </div>

      {/* EMPTY */}
      {deals.length === 0 && (
        <div className="empty-state">
          <h3>No Deals Yet</h3>
          <p>Your claimed loads will appear here.</p>
        </div>
      )}

      {/* deals */}
      {deals.length > 0 && (
        <div className="deals-grid">
          {deals.map((deal) => (
            <Card key={deal.dealId}>
   
              <div className="deal-header">
                <div className="route">
                  <span>{deal.pickup}</span>
                  <span className="arrow">→</span>
                  <span>{deal.destination}</span>
                </div>
                <span className={`status ${deal.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {deal.status}
                </span>
              </div>

              {/* deal details */}
              <div className="deal-details">
                <div className="detail">
                  <span>Deal ID</span>
                  <strong>DL-{String(deal.dealId).padStart(3, "0")}</strong>
                </div>
                <div className="detail">
                  <span>Load ID</span>
                  <strong>{deal.loadId}</strong>
                </div>
                <div className="detail">
                  <span>Load Type</span>
                  <strong>{deal.loadType || "N/A"}</strong>
                </div>
                <div className="detail">
                  <span>Weight</span>
                  <strong>{deal.weight !== null && deal.weight !== undefined ? `${deal.weight} Tons` : "N/A"}</strong>
                </div>
                <div className="detail">
                  <span>Truck Type</span>
                  <strong>{deal.truckType || "N/A"}</strong>
                </div>
                <div className="detail">
                  <span>Pickup Date</span>
                  <strong>{deal.pickupDate ? new Date(deal.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</strong>
                </div>
              </div>

              {/* loader details*/}
              <div className="loader-info">
                <div className="loader-title">Loader Details</div>
                <div className="loader-detail">
                  <span>Name</span>
                  <strong>{deal.loaderName || "N/A"}</strong>
                </div>
                <div className="loader-detail">
                  <span>Phone</span>
                  <strong>{deal.loaderPhone || "N/A"}</strong>
                </div>
                <div className="loader-detail">
                  <span>City</span>
                  <strong>{deal.loaderCity || "N/A"}</strong>
                </div>
                <div className="loader-detail">
                  <span>Loader ID</span>
                  <strong>{deal.loaderId ? `LOD-${String(deal.loaderId).padStart(3, "0")}` : "N/A"}</strong>
                </div>
              </div>

              <div className="deal-price">
                <span>Your Deal Price</span>
                <strong>₹{Number(deal.dealPrice).toLocaleString("en-IN")}</strong>
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
                <button type="button" className="complete-button" onClick={() => handleComplete(deal.dealId)} disabled={completingDeal === deal.dealId}>{completingDeal === deal.dealId ? "Completing..." : "Complete Trip"}</button>
              )}

              {deal.status === "COMPLETED" && (
                <div className="completed-message">✓ Trip Completed</div>
              )}

              {deal.status === "REJECTED" && (
                <div className="rejected-message">Deal Rejected</div>
              )}
            </Card>
          ))}
        </div>
      )}
      <style>{`
        .my-deals-page {   width: 100%; }

        .page-header { margin-bottom: 25px;}

        .page-header h1 { margin: 0 0 6px;  font-size: 28px; }

        .page-header p { margin: 0; color: #666;}

        .deals-grid {
          display: grid;
          grid-template-columns:repeat(auto-fit, minmax(320px, 1fr) );
          gap: 20px;
        }

        .deal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 22px;
        }

        .route {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 19px;
          font-weight: 700;
        }

        .arrow {  color: #777; }

        .status {
          padding: 6px 10px;
          border-radius: 5px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .pending { background: #fef3c7; color: #92400e; }

        .accepted { background: #dbeafe;color: #1d4ed8; }

        .in-transit { background: #dcfce7;color: #166534; }

        .completed {  background: #e0e7ff; color: #3730a3;}

        .rejected {  background: #fee2e2; color: #991b1b; }

        .deal-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .detail {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .detail span,
        .loader-detail span,
        .deal-price span {
          font-size: 13px;
          color: #777;
        }

        .detail strong { font-size: 15px; }

        .loader-info {
          padding: 15px;
          background: #f5f6f8;
          border-radius: 7px;
          margin-bottom: 15px;
        }

        .loader-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .loader-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 0;
        }

        .loader-detail strong { font-size: 14px; }

        .deal-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
          margin-bottom: 15px;
        }

        .deal-price strong { font-size: 18px;  }

        .pending-message,
        .accepted-message {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border-radius: 6px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
        }

        .pending-message {
          background: #fef3c7;
          color: #92400e;
        }

        .accepted-message {background: #dbeafe;color: #1d4ed8;}

        .complete-button {
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

        .complete-button:hover { opacity: 0.9; }

        .complete-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .completed-message {
          width: 100%;
          padding: 12px;
          box-sizing: border-box;
          text-align: center;
          border-radius: 6px;
          background: #e0e7ff;
          color: #3730a3;
          font-weight: 600;
        }

        .rejected-message {
          width: 100%;
          padding: 12px;
          box-sizing: border-box;
          text-align: center;
          border-radius: 6px;
          background: #fee2e2;
          color: #991b1b;
          font-weight: 600;
        }

        .empty-state {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
        }

        .empty-state h3 { margin-bottom: 8px;}

        .empty-state p { color: #666; margin: 0; }
      `}</style>
    </div>
  );
}
export default MyDeals;
