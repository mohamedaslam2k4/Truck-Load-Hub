import { useState, useEffect } from "react";
import Card from "../../components/Card";
import { API_URL } from "../../api";

function ManageLoads() {
  const [showForm, setShowForm] = useState(false);
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // Fallback to _id or id depending on database model
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const loaderId = currentUser.id || currentUser._id;

  const todayStr = new Date().toLocaleDateString("en-CA");

  const [formData, setFormData] = useState({
    pickup: "",
    destination: "",
    loadType: "",
    weight: "",
    truckType: "",
    pickupDate: "",
    minPrice: "",
    maxPrice: "",
    description: "",
  });

  const fetchMyLoads = async () => {
    
    if (!loaderId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/loads/loader/${loaderId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch loads");
      }
      const data = await response.json();
      setLoads(data);
    } catch (error) {
      console.error("Error fetching loads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLoads();
  }, [loaderId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateLoad = async (e) => {
    e.preventDefault();

    if (!loaderId) {
      alert("User session expired. Please log in again.");
      return;
    }

    if (Number(formData.minPrice) > Number(formData.maxPrice)) {
      alert("Minimum price cannot be greater than maximum price.");
      return;
    }

    const payload = {
      ...formData,
      weight: parseInt(formData.weight, 10),
      minPrice: parseFloat(formData.minPrice),
      maxPrice: parseFloat(formData.maxPrice),
      loaderId: loaderId,
    };

    try {
      const response = await fetch(`${API_URL}/loads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Failed to create load.");
        return;
      }

      alert("Load created successfully.");
      fetchMyLoads();
      setShowForm(false);
      setFormData({
        pickup: "",
        destination: "",
        loadType: "",
        weight: "",
        truckType: "",
        pickupDate: "",
        minPrice: "",
        maxPrice: "",
        description: "",
      });
    } catch (error) {
      console.error("Create load error:", error);
      alert("Unable to connect to server.");
    }
  };

  const handleCancelLoad = async (loadId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this load?");
    if (!confirmCancel) return;

    try {
      const response = await fetch(`${API_URL}/loads/${loadId}/cancel`, {
        method: "PUT",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || "Failed to cancel load.");
        return;
      }

      alert("Load cancelled successfully.");
      fetchMyLoads();
    } catch (error) {
      console.error("Cancel load error:", error);
      alert("Unable to connect to server.");
    }
  };

  const filteredLoads = filter === "ALL" ? loads : loads.filter((load) => load.status === filter);

  return (
    <div role="LOADER">
      <div className="manage-loads-page">
        <div className="page-header">
          <div>
            <h1>Manage Loads</h1>
            <p>Create and manage your loads.</p>
          </div>

          <button type="button" className="toggle-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "- Hide Create Load " : "+ Create New Load "}
          </button>
        </div>

        {/* CREATE LOAD */}
        {showForm && (
          <div className="create-section">
            <Card>
              <h2>Create New Load</h2>
              <p className="section-description">
                Enter the details of the load you want to publish.
              </p>
             <form className="load-form" onSubmit={handleCreateLoad}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="pickup">Pickup Location</label>
                    <input type="text" id="pickup" name="pickup" placeholder="Eg: Mumbai" value={formData.pickup} onChange={handleChange} maxLength={30} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="destination">Drop Location</label>
                    <input type="text" id="destination" name="destination" placeholder="Eg: Pune" value={formData.destination} onChange={handleChange} maxLength={30} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="loadType">Load Type</label>
                    <input type="text" id="loadType" name="loadType" placeholder="Eg: General" value={formData.loadType} onChange={handleChange} maxLength={30} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight">Weight (Tons)</label>
                    <input type="number" id="weight" name="weight" placeholder="Eg: 10" min="0" max="10000" step="1" value={formData.weight} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="truckType">Truck Type</label>
                    <input type="text" id="truckType" name="truckType" placeholder="Eg: Open" value={formData.truckType} onChange={handleChange} maxLength={30} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pickupDate">Pickup Date</label>
                    <input type="date" id="pickupDate" name="pickupDate" value={formData.pickupDate} onChange={handleChange} min={todayStr} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="minPrice">Minimum Price (₹)</label>
                    <input type="number" id="minPrice" name="minPrice" placeholder="Eg: 20000" min="0" max="10000000" value={formData.minPrice} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="maxPrice">Maximum Price (₹)</label>
                    <input type="number" id="maxPrice" name="maxPrice" placeholder="Eg: 25000" min="0" max="10000000" value={formData.maxPrice} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea id="description" name="description" rows="4" placeholder="Enter additional load details..." value={formData.description} onChange={handleChange} maxLength={200} />
                </div>
                <button type="submit" className="create-button">Create Load</button>
              </form>
           </Card>
        </div>
              )}
              
              {/* MY LOADS */}
              <div className="my-loads-section">
              <div className="section-header">
                <div>
                  <h2>My Loads</h2>
                  <p>Loads created by you.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="ALL">All Loads</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="BOOKED">Booked</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <span className="load-count">{filteredLoads.length} Loads</span>
                </div>
              </div>
              
              <div className="loads-grid">
                {loading ? (
                  <p>Loading your loads...</p>
                ) : filteredLoads.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Loads Found</h3>
                    <p>No loads match the selected filter criteria.</p>
                  </div>
                ) : (
                  filteredLoads.map((load) => {
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
                          <span className={`status ${status.toLowerCase()}`}>{status}</span>
                        </div>
              
                        <div className="load-details">
                          <div className="detail">
                            <strong>Load Type : </strong>
                            <span>{load.loadType || "N/A"}</span>
                          </div>
                          <div className="detail">
                            <strong>Weight :</strong>
                            <span>{load.weight ? `${load.weight} Tons` : "N/A"}</span>
                          </div>
                          <div className="detail">
                            <strong>Truck Type :</strong>
                            <span>{load.truckType || "N/A"}</span>
                          </div>
                          <div className="detail">
                            <strong>Pickup Date :</strong>
                            <span>{load.pickupDate || "N/A"}</span>
                          </div>
                        </div>
              
                        <div className="price">
                          <strong>Price Range :</strong>
                          <strong>
                            ₹{Number(load.minPrice).toLocaleString()} - ₹{Number(load.maxPrice).toLocaleString()}
                          </strong>
                        </div>
              
                        {load.description && (
                          <div className="description">
                            <strong>Description : </strong>
                            <span>{load.description}</span>
                          </div>
                        )}
              
                        {status === "AVAILABLE" && (
                          <button type="button" className="cancel-button" onClick={() => handleCancelLoad(currentLoadId)}>Cancel Load</button>
                        )}
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
        .toggle-button { padding: 11px 18px; border: 1px solid #222; border-radius: 6px; background: white; color: #222; font-weight: 600; cursor: pointer; }
        .toggle-button:hover { background: #f5f5f5; }
        .create-section { margin-top: 15px; margin-bottom: 40px; }
        .load-id { display: block; color: #6b7280; font-size: 12px; font-weight: 600; background: #d2d8e5; padding: 6px 9px; border-radius: 5px; }
        .create-section h2 { margin: 0 0 6px; font-size: 21px; }
        .section-description { margin: 0 0 25px; color: #666; }
        .load-form { width: 100%; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .form-group { margin-bottom: 18px; }
        .form-group label { display: block; margin-bottom: 7px; font-weight: 600; }
        .form-group input, .form-group textarea { width: 100%; padding: 11px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 15px; font-family: inherit; }
        .form-group textarea { resize: vertical; }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #222; }
        .create-button { width: 100%; padding: 13px; border: none; border-radius: 6px; background: #222; color: white; font-weight: 600; cursor: pointer; }
        .my-loads-section { margin-top: 10px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-header h2 { margin: 0 0 5px; font-size: 22px; }
        .section-header p { margin: 0; color: #666; }
        .filter-select { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; background: #fff; font-size: 14px; cursor: pointer; }
        .load-count { padding: 7px 12px; background: #eee; border: 1px solid #a9a8a8; border-radius: 5px; font-size: 13px; font-weight: 600; }
        .loads-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
        .load-header { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid black; }
        .route { display: flex; align-items: center; gap: 9px; font-size: 19px; font-weight: 700; }
        .arrow { color: #777; }
        .status { padding: 6px 9px; border-radius: 5px; font-size: 11px; font-weight: 700; white-space: nowrap; }
        .available { background: #e6f4ea; color: #137333; }
        .booked { background: #fff3e0; color: #b78103; }
        .cancelled { background: #fce8e6; color: #c5221f; }
        .completed { background: #e8eaf6; color: #3f51b5; }
        .load-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .detail { display: flex; align-items: center; gap: 5px; }
        .detail span, .description span { font-size: 13px; color: #777; }
        .detail strong { font-size: 15px; }
        .price { display: flex; justify-content: space-evenly; align-items: center; padding: 14px 0; border-radius: 6px; border: 1px solid #e2e2e2; margin-bottom: 10px; background: #e7efff; }
        .price strong { font-size: 17px; }
        .description { display: flex; align-items: center; gap: 2px; margin-bottom: 10px; }
        .cancel-button { width: 100%; padding: 11px; border: 1px solid #ccc; border-radius: 6px; background: #eee; color: #222; font-weight: 600; cursor: pointer; }
        .empty-state { grid-column: 1 / -1; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 40px; text-align: center; }
        .empty-state h3 { margin-bottom: 8px; }
        .empty-state p { margin: 0; color: #666; }
      `}</style>
    </div>
  );
}

export default ManageLoads;
