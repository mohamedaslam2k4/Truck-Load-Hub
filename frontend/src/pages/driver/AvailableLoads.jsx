import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { API_URL } from "../../api"; 

function AvailableLoads() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealPrices, setDealPrices] = useState({});

  // get available loads from db
  const fetchAvailableLoads = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/driver/available-loads`);
      const data = await response.json();

      if (!response.ok) {throw new Error(data.detail || "Failed to fetch available loads");}

      setLoads(data);
    } catch (error) {
      console.error("Error fetching loads:", error);
      alert("Unable to load available loads");
    } finally {
      setLoading(false);
    }};

  useEffect(() => {
    fetchAvailableLoads();
  }, []);

  // deal price change
  const handlePriceChange = (loadId, value) => {setDealPrices((previous) => ({ ...previous,[loadId]: value,})); };

  //make deal
  const handleMakeDeal = async (load) => {
    const price = dealPrices[load.id];

    // Check price entered
    if (price === undefined || price === "") { 
      alert("Please enter your deal price.");
      return;
    }
    const numericPrice = Number(price);

    // Check valid number
    if (!Number.isFinite(numericPrice)) {alert("Please enter a valid price.");return;}

    // Check price range
    if ( numericPrice < Number(load.minPrice) || numericPrice > Number(load.maxPrice)) {
      alert(`Enter a price between ₹${Number(load.minPrice).toLocaleString()} and ₹${Number(load.maxPrice).toLocaleString()}`);
      return;
    }

    //get logined user
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {alert("User information not found. Please login again."); return;}

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      alert("Invalid login information. Please login again.");
      return;
    }
    if (!user || !user.id) { alert("User information not found. Please login again."); return;}

    // Make sure logged-in user is a driver
    if (user.role !== "DRIVER") { alert("Only drivers can make a deal."); return;}

    // send the deal to backend
    try {
      const response = await fetch(`${API_URL}/driver/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loadId: load.id, driverId: user.id,  dealPrice: numericPrice,  }), });

      const data = await response.json();

      if (!response.ok) {alert(data.detail || "Failed to create deal");
        return;
      }

      // deal success
      alert( `Deal request sent successfully for ${load.pickup} → ${load.destination}` );
      console.log("Deal created:", data);

      // remove the loads from available loads
      setLoads((previousLoads) =>previousLoads.filter((item) => item.id !== load.id));

      // remove stored price for this load
      setDealPrices((previousPrices) => {
        const updatedPrices = { ...previousPrices };
        delete updatedPrices[load.id];
        return updatedPrices;
      });
    } catch (error) {
      console.error("Deal error:", error);
      alert("Unable to connect to server");
    }
  };


 return (
    <div className="available-loads-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Available Loads</h1>
        <p>Find available loads and make a deal with loaders.</p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="loading">Loading available loads...</div>
      )}

      {/* EMPTY */}
      {!loading && loads.length === 0 && (
        <div className="empty-state">
          <h3>No Available Loads</h3>
          <p>There are currently no available loads.</p>
        </div>
      )}

      {/* LOADS */}
      {!loading && loads.length > 0 && (
        <div className="loads-grid">
          {loads.map((load) => (
            <Card key={load.id}>
              
              <div className="route">
                <span>{load.pickup}</span>
                <span>→</span>
                <span>{load.destination}</span>
              </div>

              {/* LOAD DETAILS */}
              <div className="load-details">
                <div className="detail">
                  <span>Load Type</span>
                  <strong>{load.loadType || "N/A"}</strong>
                </div>

                <div className="detail">
                  <span>Weight</span>
                  <strong>{load.weight !== null && load.weight !== undefined ? `${load.weight} Tons` : "N/A"}</strong>
                </div>

                <div className="detail">
                  <span>Truck Type</span>
                  <strong>{load.truckType || "N/A"}</strong>
                </div>

                <div className="detail">
                  <span>Pickup Date</span>
                  <strong>{load.pickupDate ? new Date(load.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</strong>
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
                <strong>₹{Number(load.minPrice).toLocaleString()} - ₹{Number(load.maxPrice).toLocaleString()}</strong>
              </div>

              {/* DEAL */}
              <div className="deal-section">
                <label>Your Deal Price</label>
                <input type="number" min="0" step="1" placeholder="Enter your price" value={dealPrices[load.id] ?? ""} 
                onChange={(e) => { const value = e.target.value; 
                if (value === "" || Number(value) >= 0) { handlePriceChange(load.id, value); } }} />

                <button type="button" onClick={() => handleMakeDeal(load)}>Make a Deal</button>
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
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .route {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 22px;
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
          gap: 5px;
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
          margin: 6px 0 0;
          font-size: 14px;
          color: #555;
          line-height: 1.5;
        }

        .price-range {
          padding: 15px;
          background: #f5f6f8;
          border-radius: 7px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .price-range strong {
          font-size: 17px;
        }

        .deal-section {
          border-top: 1px solid #eee;
          padding-top: 20px;
        }

        .deal-section label {
          display: block;
          font-weight: 600;
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
        }

        .deal-section button:hover {
          opacity: 0.9;
        }

        .loading {
          padding: 50px 20px;
          text-align: center;
          color: #666;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
        }

        .empty-state h3 {
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #777;
        }
      `}</style>
    </div>
  );
}

export default AvailableLoads;
