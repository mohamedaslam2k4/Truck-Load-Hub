import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { API_URL } from "../../api";

function AvailableLoads() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealPrices, setDealPrices] = useState({});
  const [submittingLoadId, setSubmittingLoadId] = useState(null);

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

  const handlePriceChange = (loadId, value) => {
    setDealPrices((previous) => ({
      ...previous,
      [loadId]: value,
    }));
  };

  const handleMakeDeal = async (load) => {
    const currentLoadId = load.id || load._id;
    const price = dealPrices[currentLoadId];

    if (price === undefined || price === "") {
      alert("Please enter your deal price.");
      return;
    }
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      alert("Please enter a valid price.");
      return;
    }

    if (
      numericPrice < Number(load.minPrice) ||
      numericPrice > Number(load.maxPrice)
    ) {
      alert(
        `Enter a price between ₹${Number(load.minPrice).toLocaleString("en-IN")} and ₹${Number(load.maxPrice).toLocaleString("en-IN")}`
      );
      return;
    }

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

    const driverId = user?.id || user?._id || user?.driverId || user?.userId;

    if (!driverId) {
      alert("Driver user details not found. Please login again.");
      return;
    }

    if (user.role !== "DRIVER") {
      alert("Only registered drivers can submit a deal.");
      return;
    }

    try {
      setSubmittingLoadId(currentLoadId);
      const response = await fetch(`${API_URL}/driver/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loadId: currentLoadId,
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

      setLoads((previousLoads) =>
        previousLoads.filter((item) => (item.id || item._id) !== currentLoadId)
      );

      setDealPrices((previousPrices) => {
        const updatedPrices = { ...previousPrices };
        delete updatedPrices[currentLoadId];
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
    <div role="DRIVER">
      <div className="manage-loads-page">
        <div className="page-header">
          <div>
            <h1>Available Loads</h1>
            <p>Find available loads and make a deal with loaders.</p>
          </div>
        </div>

        <div className="my-loads-section">
          <div className="section-header">
            <div>
              <h2>Marketplace Loads</h2>
              <p>Loads open for biddings and deals.</p>
            </div>
            <div>
              <span className="load-count">{loads.length} Loads</span>
            </div>
          </div>

          <div className="loads-grid">
            {loading ? (
              <p>Loading available loads...</p>
            ) : loads.length === 0 ? (
              <div className="empty-state">
                <h3>No Available Loads</h3>
                <p>There are currently no loads available for bidding.</p>
              </div>
            ) : (
              loads.map((load) => {
                const currentLoadId = load.id || load._id;
                const status = load.status || "AVAILABLE";

                return (
                  <Card key={currentLoadId}>
                    <div className="load-header">
                      <span className="load-id">Load # {currentLoadId}</span>
                      <div className="route">
                        <span>{load.pickup}</span>
                        <span className="arrow">→</span>
                        <span>{load.destination}</span>
                      </div>
                      <span className={`status ${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </div>

                    <div className="load-details">
                      <div className="detail">
                        <strong>Load Type : </strong>
                        <span>{load.loadType || "N/A"}</span>
                      </div>
                      <div className="detail">
                        <strong>Weight :</strong>
                        <span>
                          {load.weight ? `${load.weight} Tons` : "N/A"}
                        </span>
                      </div>
                      <div className="detail">
                        <strong>Truck Type :</strong>
                        <span>{load.truckType || "N/A"}</span>
                      </div>
                      <div className="detail">
                        <strong>Pickup Date :</strong>
                        <span>{formatDate(load.pickupDate)}</span>
                      </div>
                    </div>

                    <div className="price">
                      <strong>Price Range :</strong>
                      <strong>
                        ₹{Number(load.minPrice || 0).toLocaleString()} - ₹
                        {Number(load.maxPrice || 0).toLocaleString()}
                      </strong>
                    </div>

                    {load.description && (
                      <div className="description">
                        <strong>Description : </strong>
                        <span>{load.description}</span>
                      </div>
                    )}

                    <div className="deal-section">
                      {/* INLINE LABEL & INPUT */}
                      <div className="form-group inline-group">
                        <label htmlFor={`price-${currentLoadId}`}>
                          Your Deal Price (₹) :
                        </label>
                        <input
                          id={`price-${currentLoadId}`}
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Enter price"
                          value={dealPrices[currentLoadId] ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || Number(value) >= 0) {
                              handlePriceChange(currentLoadId, value);
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="create-button"
                        onClick={() => handleMakeDeal(load)}
                        disabled={submittingLoadId === currentLoadId}
                      >
                        {submittingLoadId === currentLoadId
                          ? "Sending Deal..."
                          : "Make a Deal"}
                      </button>
                    </div>
                  </Card>
                );
              })
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
        
        /* INLINE INPUT FORM FIELD STYLES */
        .form-group.inline-group { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .form-group.inline-group label { margin-bottom: 0; font-weight: 600; font-size: 14px; white-space: nowrap; }
        .form-group.inline-group input { flex: 1; padding: 10px 11px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; font-family: inherit; }
        .form-group.inline-group input:focus { outline: none; border-color: #222; }

        .create-button { width: 100%; padding: 13px; border: none; border-radius: 6px; background: #222; color: white; font-weight: 600; cursor: pointer; font-size: 14px; }
        .create-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .my-loads-section { margin-top: 20px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-header h2 { margin: 0 0 5px; font-size: 22px; }
        .section-header p { margin: 0; color: #666; }
        .load-count { padding: 7px 12px; background: #eee; border: 1px solid #a9a8a8; border-radius: 5px; font-size: 13px; font-weight: 600; }
        .loads-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
        .load-header { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid black; }
        .route { display: flex; align-items: center; gap: 9px; font-size: 19px; font-weight: 700; }
        .arrow { color: #777; }
        .status { padding: 6px 9px; border-radius: 5px; font-size: 11px; font-weight: 700; white-space: nowrap; text-transform: uppercase; }
        .available { background: #e6f4ea; color: #137333; }
        .booked { background: #fff3e0; color: #b78103; }
        .cancelled { background: #fce8e6; color: #c5221f; }
        .completed { background: #e8eaf6; color: #3f51b5; }
        .load-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .detail { display: flex; align-items: center; gap: 5px; }
        .detail span, .description span { font-size: 13px; color: #777; }
        .detail strong { font-size: 15px; }
        .price { display: flex; justify-content: space-evenly; align-items: center; padding: 14px 0; border-radius: 6px; border: 1px solid #e2e2e2; margin-bottom: 15px; background: #e7efff; }
        .price strong { font-size: 17px; }
        .description { display: flex; align-items: center; gap: 5px; margin-bottom: 15px; }
        .deal-section { border-top: 1px solid #eee; padding-top: 15px; margin-top: 5px; }
        .empty-state { grid-column: 1 / -1; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 40px; text-align: center; }
        .empty-state h3 { margin-bottom: 8px; }
        .empty-state p { margin: 0; color: #666; }
      `}</style>
    </div>
  );
}

export default AvailableLoads;
