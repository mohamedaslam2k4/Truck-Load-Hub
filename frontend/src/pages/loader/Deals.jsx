import { useEffect, useState } from "react";

function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [processingDeal, setProcessingDeal] = useState(null);

  //get login loader
  const user = JSON.parse(localStorage.getItem("user"));
  const loaderId = user?.id;

  // fetch deals
  const fetchDeals = async () => {
    if (!loaderId) {
       alert("Loader information not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/deals/loader/${loaderId}`);
      const data = await response.json();

      if (!response.ok) {throw new Error(data.detail || "Failed to fetch deals");}
      setDeals(data);
    } catch (error) {
      console.error("Error fetching deals:", error);
      alert("Unable to load deals");
    } finally {
      setLoading(false);
    }};

  useEffect(() => {fetchDeals();}, [loaderId]);

  // Accept deal(PENDING → ACCEPTED)
  const handleAcceptDeal = async (dealId) => {
    const confirmAccept = window.confirm("Are you sure you want to accept this deal?");
    if (!confirmAccept) return;

    try {
      setProcessingDeal(dealId);
      const response = await fetch(`http://127.0.0.1:8000/deals/${dealId}/accept`, {method: "PUT",headers: {"Content-Type": "application/json",},});

      const data = await response.json();

      if (!response.ok) {throw new Error(data.detail || "Failed to accept deal");}

      //Set deals status ="accept" function

      setDeals((previousDeals) => previousDeals.map((deal) =>deal.dealId === dealId ? { ...deal, status: "ACCEPTED" } : deal ));
      alert("Deal accepted successfully");
    } catch (error) {
      console.error("Accept deal error:", error);
      alert(error.message);
    } finally {
      setProcessingDeal(null);
    }};

  // StartTrip (ACCEPTED → IN TRANSIT)

  const handleStartTrip = async (dealId) => {
    const confirmStart = window.confirm("Are you sure you want to start this trip?");
    if (!confirmStart) return;
    try {
      setProcessingDeal(dealId);
      const response = await fetch(`http://127.0.0.1:8000/deals/${dealId}/start`, { method: "PUT", headers: { "Content-Type": "application/json",}, });

      const data = await response.json();

      if (!response.ok) {throw new Error(data.detail || "Failed to start trip");}

       //Set deals stsatus ="in transit" function
      setDeals((previousDeals) => previousDeals.map((deal) =>deal.dealId === dealId ? { ...deal, status: "IN TRANSIT" } : deal));
      alert("Trip started successfully");

    } catch (error) {
      console.error("Start trip error:", error);
      alert(error.message);
    } finally {setProcessingDeal(null);
     }};

  //filter
  const filteredDeals = filter === "ALL" ? deals : deals.filter((deal) => deal.status === filter);

  return (
    <div className="deals-page">
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
          <select className="filter-select"value={filter}  onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All Deals</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN TRANSIT">In Transit</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/*check condition loading (or) content */}
        {loading ? ( <div className="loading-state">Loading deals...</div> ) : filteredDeals.length === 0 ? 

        (
          <div className="empty-state">
            <h3>No Deals Found</h3>
            <p>Driver deals will appear here.</p>
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
                  <span className={`status ${deal.status .toLowerCase()  .replace(/\s+/g, "-")}`} >{deal.status} </span>
                </div>

                {/* load details */}
                <div className="deal-details">
                  <div className="detail">
                    <span>Load Type</span>
                    <strong>{deal.loadType || "N/A"}</strong>
                  </div>

                  <div className="detail">
                    <span>Weight</span>
                    <strong>{deal.weight ? `${deal.weight} Tons` : "N/A"}</strong>
                  </div>

                  <div className="detail">
                    <span>Truck Type</span>
                    <strong>{deal.truckType || "N/A"}</strong>
                  </div>

                  <div className="detail">
                    <span>Pickup Date</span>
                    <strong>{deal.pickupDate || "N/A"}</strong>
                  </div>
                </div>

                {/* driver details */}
                <div className="driver-info">
                  <div className="driver-title">Driver Details</div>

                  <div className="driver-row">
                    <span>Name</span>
                    <strong>{deal.driverName || "N/A"}</strong>
                  </div>

                  <div className="driver-row">
                    <span>Phone</span>
                    <strong>{deal.driverPhone || "N/A"}</strong>
                  </div>

                  <div className="driver-row">
                    <span>City</span>
                    <strong>{deal.driverCity || "N/A"}</strong>
                  </div>

                  <div className="driver-row">
                    <span>Vehicle</span>
                    <strong>{deal.vehicleType || "N/A"}</strong>
                  </div>

                  <div className="driver-row">
                    <span>Truck Number</span>
                    <strong>{deal.vehicleNumber || "N/A"}</strong>
                  </div>
                </div>

                {/* price */}
                <div className="deal-price">
                  <span>Agreed Deal Price</span>
                  <strong>₹{Number(deal.dealPrice).toLocaleString("en-IN")}</strong>
                </div>

                {deal.status === "PENDING" && (
                  <button type="button" className="accept-button"  onClick={() => handleAcceptDeal(deal.dealId)} disabled={processingDeal === deal.dealId}  >
                    {processingDeal === deal.dealId ? "Processing..." : "Accept Deal"}
                  </button>
                )}

                {deal.status === "ACCEPTED" && (
                  <button type="button" className="start-button" onClick={() => handleStartTrip(deal.dealId)}  disabled={processingDeal === deal.dealId}>
                    {processingDeal === deal.dealId ? "Starting..." : "Start Trip"}
                  </button>
                )}

                {deal.status === "IN TRANSIT" && (<div className="transit-message"> Trip is currently <strong>Deal In Transit</strong>.<br /> Driver can complete the trip after delivery. </div> )}

                {deal.status === "COMPLETED" && ( <div className="completed-message">Deal Completed</div> )}

                {deal.status === "REJECTED" && ( <div className="rejected-message">Deal Rejected</div> )}
              </div>
            ))}
          </div>
        )}
      </div>
     <style>{`
        .deals-page { padding: 24px; width: 100%; box-sizing: border-box; }

        .page-header { margin-bottom: 24px; }

        .page-header h1 { margin: 0 0 6px; font-size: 28px; font-weight: 700; }

        .page-header p { margin: 0; color: #6b7280; font-size: 14px; }

        .deals-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }

        .card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb; }

        .card-header h2 { margin: 0 0 5px; font-size: 18px; }

        .card-header p { margin: 0; color: #6b7280; font-size: 13px; }

        .filter-select { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; background: #fff; font-size: 14px; cursor: pointer; }

        .deals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px; padding: 20px; }

        .deal-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; background: #fff; }

        .deal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; margin-bottom: 20px; }

        .deal-id { display: block; color: #6b7280; font-size: 12px; font-weight: 600; margin-bottom: 7px; }

        .route { display: flex; align-items: center; gap: 9px; font-size: 19px; font-weight: 700; }

        .arrow { color: #777; }

        .status { display: inline-flex; padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }

        .pending { background: #fef3c7; color: #92400e; }

        .accepted { background: #dbeafe; color: #1d4ed8; }

        .in-transit { background: #dcfce7; color: #166534; }

        .completed { background: #e0e7ff; color: #3730a3; }

        .rejected { background: #fee2e2; color: #991b1b; }

        .deal-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }

        .detail { display: flex; flex-direction: column; gap: 5px; }

        .detail span { font-size: 13px; color: #777; }

        .detail strong { font-size: 15px; }

        .driver-info { padding: 15px; background: #f5f6f8; border-radius: 7px; margin-bottom: 15px; }

        .driver-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; }

        .driver-row { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 8px; }

        .driver-row:last-child { margin-bottom: 0; }

        .driver-row span { color: #777; font-size: 13px; }

        .driver-row strong { font-size: 14px; text-align: right; }

        .deal-price { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 15px; }

        .deal-price span { color: #777; font-size: 13px; }

        .deal-price strong { font-size: 19px; }

        .accept-button, .start-button { width: 100%; padding: 12px; border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; font-size: 14px; }

        .accept-button { background: #222; }

        .start-button { background: #29a85a; }

        .accept-button:hover, .start-button:hover { opacity: 0.9; }

        .accept-button:disabled, .start-button:disabled { opacity: 0.6; cursor: not-allowed; }

        .transit-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #dcfce7; color: #166534; text-align: center; font-size: 13px; line-height: 1.5; }

        .completed-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #e0e7ff; color: #3730a3; text-align: center; font-size: 13px; font-weight: 600; }

        .rejected-message { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: #fee2e2; color: #991b1b; text-align: center; font-size: 13px; font-weight: 600; }

        .loading-state { padding: 50px; text-align: center; color: #666; }

        .empty-state { padding: 50px; text-align: center; }

        .empty-state h3 { margin: 0 0 8px; }

        .empty-state p { margin: 0; color: #666; }
`}</style>
    </div>
  );
}

export default Deals;