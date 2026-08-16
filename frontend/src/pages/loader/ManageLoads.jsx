import { useState, useEffect } from "react";
import Card from "../../components/Card";
import { API_URL } from "../../api"; 


function ManageLoads() {
  //  Set default state to false to hide form initially
  const [showForm, setShowForm] = useState(false);
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get logged-in user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const loaderId = currentUser.id;

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

  // Fetch only this loader's loads from DB
  const fetchMyLoads = async () => {
    if (!loaderId) return;
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
      const response = await fetch(`${API_URL}/loads`, { method: "POST", headers: { "Content-Type": "application/json" },  body: JSON.stringify(payload),});

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Failed to create load.");
        return;
      }

      alert("Load created successfully.");

      // Refresh list from database
      fetchMyLoads();

      // Close the form on submission
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
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this load?"
    );

    if (!confirmCancel) return;


   //loads update
    try {
      const response = await fetch(`${API_URL}/loads/${loadId}/cancel`, { method: "PUT" });

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

  return (
    <div role="LOADER">
      <div className="manage-loads-page">
        <div className="page-header">
          <div>
            <h1>Manage Loads</h1>
            <p>Create and manage your loads.</p>
          </div>

          <button type="button" className="toggle-button" onClick={() => setShowForm(!showForm)} >
            {showForm ? "- Hide Create Load " : "+ Create New Load "}
          </button>
        </div>

        {/* CREATE LOAD */}
        {showForm && (
          <div className="create-section">
            <Card>
              <h2>Create New Load</h2>
              <p className="section-description"> Enter the details of the load you want to publish.</p>
              <form className="load-form" onSubmit={handleCreateLoad}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="pickup">Pickup Location</label>
                    <input type="text" id="pickup" name="pickup" placeholder="Eg: Mumbai" value={formData.pickup} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="destination">Drop Location</label>
                    <input type="text" id="destination" name="destination" placeholder="Eg: Pune" value={formData.destination} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="loadType">Load Type</label>
                    <input type="text" id="loadType" name="loadType" placeholder="Eg: General" value={formData.loadType} onChange={handleChange} required />
                    </div>
                  <div className="form-group">
                    <label htmlFor="weight">Weight (Tons)</label>
                    <input type="number" id="weight" name="weight" placeholder="Eg: 10" min="0" step="1" value={formData.weight} onChange={handleChange} required />
                    </div>
                  <div className="form-group">
                    <label htmlFor="truckType">Truck Type</label>
                    <input type="text" id="truckType" name="truckType" placeholder="Eg: Open" value={formData.truckType} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pickupDate">Pickup Date</label>
                    <input type="date" id="pickupDate" name="pickupDate" value={formData.pickupDate} onChange={handleChange} required />
                    </div>
                  <div className="form-group">
                    <label htmlFor="minPrice">Minimum Price (₹)</label>
                    <input type="number" id="minPrice" name="minPrice" placeholder="Eg: 20000" min="0" value={formData.minPrice} onChange={handleChange} required />
                    </div>
                  <div className="form-group">
                    <label htmlFor="maxPrice">Maximum Price (₹)</label>
                  <input type="number" id="maxPrice" name="maxPrice" placeholder="Eg: 25000" min="0" value={formData.maxPrice} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea id="description" name="description" rows="4" placeholder="Enter additional load details..." value={formData.description} onChange={handleChange} />
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
            <span className="load-count">{loads.length} Loads</span>
          </div>

          <div className="loads-grid">
            {loading ? ( <p>Loading your loads...</p>) : loads.length === 0 ? (
              <div className="empty-state">
                <h3>No Loads Yet</h3>
                <p>Create your first load to make it available to drivers.</p>
              </div>
            ) : (
              loads.map((load) => (
                <Card key={load.id}>
                  <div className="load-header">
                    <div className="route">
                      <span>{load.pickup}</span>
                      <span className="arrow">→</span>
                      <span>{load.destination}</span>
                    </div>
                    <span className={`status ${load.status.toLowerCase()}`}> {load.status}</span>
                  </div>

                  <div className="load-details">
                    <div className="detail">
                      <span>Load Type</span>
                      <strong>{load.loadType}</strong>
                    </div>
                    <div className="detail">
                      <span>Weight</span>
                      <strong>{load.weight} Tons</strong>
                    </div>
                    <div className="detail">
                      <span>Truck Type</span>
                      <strong>{load.truckType}</strong>
                    </div>
                    <div className="detail">
                      <span>Pickup Date</span>
                      <strong>{load.pickupDate}</strong>
                    </div>
                  </div>

                  <div className="price">
                    <span>Price Range</span>
                    <strong>₹{Number(load.minPrice).toLocaleString()} - ₹{Number(load.maxPrice).toLocaleString()} </strong>
                  </div>

                  {load.description && (
                    <div className="description">
                      <span>Description</span>
                      <p>{load.description}</p>
                    </div>
                  )}

                  {load.status === "AVAILABLE" && (
                    <button type="button" className="cancel-button" onClick={() => handleCancelLoad(load.id)} > Cancel Load</button>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .manage-loads-page { width: 100%; }

        .page-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 25px; }

        .page-header h1 { margin: 0 0 6px; font-size: 28px; }

        .page-header p { margin: 0; color: #666; }

        .toggle-button { padding: 11px 18px; border: 1px solid #222; border-radius: 6px; background: white; color: #222; font-weight: 600; cursor: pointer; }

        .toggle-button:hover { background: #f5f5f5; }

        .create-section { margin-bottom: 40px; }

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

        .load-count { padding: 7px 12px; background: #eee; border-radius: 5px; font-size: 13px; font-weight: 600; }

        .loads-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }

        .load-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; margin-bottom: 20px; }

        .route { display: flex; align-items: center; gap: 9px; font-size: 19px; font-weight: 700; }

        .arrow { color: #777; }

        .status { padding: 6px 9px; border-radius: 5px; font-size: 11px; font-weight: 700; white-space: nowrap; }

        .available { background: #222; color: white; }

        .booked { background: #eee; color: #222; }

        .cancelled { background: #ddd; color: #666; }

        .completed { background: #ddd; color: #222; }

        .load-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }

        .detail { display: flex; flex-direction: column; gap: 5px; }

        .detail span, .price span, .description span { font-size: 13px; color: #777; }

        .detail strong { font-size: 15px; }

        .price { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 15px; }

        .price strong { font-size: 17px; }

        .description { margin-bottom: 15px; }

        .description p { margin: 6px 0 0; color: #555; line-height: 1.5; }

        .cancel-button { width: 100%; padding: 11px; border: 1px solid #ccc; border-radius: 6px; background: #eee; color: #222; font-weight: 600; cursor: pointer; }

        .empty-state { grid-column: 1 / -1; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 40px; text-align: center; }

        .empty-state h3 { margin-bottom: 8px; }

        .empty-state p { margin: 0; color: #666; }
      `}</style>
    </div>
  );
}

export default ManageLoads;
