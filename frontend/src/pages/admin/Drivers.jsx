import { useEffect, useState } from "react";
import { API_URL } from "../../api"; 


function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/admin/drivers`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch drivers");
      }

      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      alert("Unable to load drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const getStatusClass = (status) => {
    return status ? status.toLowerCase() : "pending";
  };

  return (
    <div className="drivers-page">
      <div className="page-header">
        <div>
          <h1>Drivers</h1>
          <p>View registered driver profiles and truck details.</p>
        </div>
      </div>

      <div className="drivers-card">
        <div className="card-header">
          <div>
            <h2>Registered Drivers</h2>
            <p>{drivers.length} drivers registered</p>
          </div>

          <span className="driver-count">{drivers.length}</span>
        </div>
      
        {loading && <div className="loading">Loading drivers...</div>}

        {!loading && drivers.length === 0 && (
          <div className="empty-state">
            <h3>No Drivers Found</h3>
            <p>There are no registered drivers.</p>
          </div>
        )}

        {!loading && drivers.length > 0 && (
          <div className="drivers-grid">
            {drivers.map((driver) => (
              <div className="driver-card" key={driver.id}>
                <div className="driver-card-header">
                  <div className="driver-name">
                    <div className="driver-avatar">
                      {driver.name ? driver.name.charAt(0).toUpperCase() : "D"}
                    </div>

                    <div>
                      <h3>{driver.name || "N/A"}</h3>
                      <span className="driver-id">
                        DRV-{String(driver.driverid).padStart(3, "0")}
                      </span>
                    </div>
                  </div>

                  <span className={`status-badge ${getStatusClass(driver.status)}`}>
                    {driver.status || "PENDING"}
                  </span>
                </div>

                <div className="section-title">Personal Details</div>

                <div className="driver-details">
                  <div className="detail-item">
                    <span>Email</span>
                    <strong>{driver.email || "N/A"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>Phone</span>
                    <strong>{driver.phone || "N/A"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>City</span>
                    <strong>{driver.city || "N/A"}</strong>
                  </div>
                </div>

                <div className="section-title truck-title">Truck Details</div>

                <div className="driver-details">
                  <div className="detail-item">
                    <span>Truck Type</span>
                    <strong>{driver.truckType || "N/A"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>Truck Number</span>
                    <strong>{driver.truckNumber || "N/A"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>Capacity</span>
                    <strong>
                      {driver.capacity !== null &&  driver.capacity !== undefined ? `${driver.capacity} Tons` : "N/A"}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Experience</span>
                    <strong>
                      {driver.experience !== null && driver.experience !== undefined? `${driver.experience} Years`  : "N/A"}
                    </strong>
                  </div>
                  <div className="detail-item">
                  <span>License Number</span>
                  <strong>{driver.licenseNumber || "N/A"}</strong>
                </div>
             
              </div>

                <div className="license-section">
                  <span>License Number</span>
                  <strong>{driver.licenseNumber || "N/A"}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .drivers-page {
          width: 100%;
          max-width: 1100px;
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

        .drivers-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .card-header p {
          margin: 0;
          color: #777;
          font-size: 13px;
        }

        .driver-count {
          min-width: 25px;
          height: 25px;
          padding: 0 7px;
          border-radius: 20px;
          background: #222;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: bold;
        }

        .loading {
          padding: 40px 0;
          text-align: center;
          color: #666;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          border-top: 1px solid #eee;
        }

        .empty-state h3 {
          margin: 0 0 8px;
        }

        .empty-state p {
          margin: 0;
          color: #777;
        }

        .drivers-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .driver-card {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          box-sizing: border-box;
        }

        .drivers-grid .driver-card:last-child:nth-child(odd) {
          grid-column: 1 / -1;
        }

        .driver-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }

        .driver-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .driver-name h3 {
          margin: 0 0 3px;
          font-size: 18px;
        }

        .driver-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #222;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .driver-id {
          font-size: 11px;
          color: #777;
          font-weight:600;
        }

        .status-badge {
          padding: 5px 9px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.verified {
          background: #222;
          color: #fff;
        }

        .status-badge.rejected {
          background: #eee;
          color: #666;
        }

        .section-title {
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #333;
        }

        .truck-title {
          margin-top: 22px;
        }

        .driver-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 20px;
        }

        .detail-item {
          display: flex;
    
          gap: 4px;
          min-width: 0;
        }

        .detail-item span {
          font-size: 12px;
          color: #777;
        }

        .detail-item strong {
          font-size: 14px;
          color: #222;
          word-break: break-word;
        }

        .license-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .license-section span {
          font-size: 12px;
          color: #777;
        }

        .license-section strong {
          font-size: 14px;
          color: #222;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}

export default Drivers;
