import { useEffect, useState } from "react";
import { API_URL } from "../../api"; 


function Loaders() {
  const [loaders, setLoaders] = useState([]);
  const [loading, setLoading] = useState(true);


  // fetch load from db


  const fetchLoaders = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/admin/loaders`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch loaders"
        );
      }

      setLoaders(data);

    } catch (error) {
      console.error("Error fetching loaders:", error);

      alert("Unable to load loaders.");

    } finally {
      setLoading(false);
    }
  };


  // fetch loads when loader open page

  useEffect(() => {
    fetchLoaders();
  }, []);


  // status function
  const getStatusClass = (status) => {
    if (!status) {
      return "pending";
    }
    return status.toLowerCase();
  };

  return (
    <div className="loaders-page">
      <div className="page-header">

        <div>
          <h1>Loaders</h1>
          <p>View registered loader profiles and company details. </p>
        </div>
      </div>

      <div className="loaders-card">
        <div className="card-header">

          <div>
            <h2> Registered Loaders</h2>
            <p> {loaders.length} loaders registered </p>
          </div>
          <span className="loader-count">  {loaders.length}</span>

        </div>

        {loading && (
          <div className="loading">Loading loaders... </div>
        )}

        {!loading && loaders.length === 0 && (

          <div className="empty-state">
            <h3>No Loaders Found  </h3>
            <p> There are no registered loaders.  </p>
          </div>
        )}

        {!loading && loaders.length > 0 && (
          <div className="loaders-grid">
            {loaders.map((loader) => (

              <div className="loader-row"  key={loader.id} >
                <div className="loader-card-header">
                  <div className="loader-name">

                    <div className="loader-avatar">
                      {loader.name ? loader.name.charAt(0).toUpperCase(): "L"}
                    </div>

                    <div>
                      <h3> {loader.name || "N/A"} </h3>
                      <span className="loader-id">LDR- {String(loader.loaderid).padStart(3, "0")}</span>
                    </div>
                  </div>

                  <span className={`status-badge ${getStatusClass( loader.status )}`} >
                    {loader.status || "PENDING"}
                  </span>
                </div>

              <div className="section-title"> Personal Details</div>
                <div className="loader-details">
                  <div className="detail-item">
                    <span> Email </span>
                    <strong>{loader.email || "N/A"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>Phone </span>
                    <strong>{loader.phone || "N/A"} </strong>
                  </div>

                <div className="detail-item">
                    <span> City </span>
                    <strong> {loader.city || "N/A"} </strong>
                  </div>
                </div>

              <div className="section-title company-title">Company Details</div>
                <div className="loader-details">
           
                  <div className="detail-item">
                    <span> Company Name</span>
                    <strong>{loader.companyName || "N/A"} </strong>
                  </div>

                  <div className="detail-item">
                    <span>   Contact Person  </span>
                    <strong>    {loader.contactPerson || "N/A"}  </strong>
                  </div>

                  <div className="detail-item">
                    <span>  Business Type  </span>
                    <strong>  {loader.businessType || "N/A"}</strong>
                  </div>

                  <div className="detail-item">
                    <span>  Total Loads</span>
                    <strong> {loader.totalLoads ?? 0}  </strong>
                  </div>
                </div>

                <div className="loader-footer">
                  <span> Loader ID </span>
                  <strong>  LDR- {String(loader.loaderid).padStart(3, "0")} </strong>
                </div>
              </div>

            ))}

          </div>
        )}
      </div>

     <style>{`
        .loaders-page { width: 100%;}

        .page-header { margin-bottom: 25px; }

        .page-header h1 { margin: 0 0 6px; font-size: 28px; }

        .page-header p { margin: 0; color: #666; }

        .loaders-card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

        .card-header h2 { margin: 0 0 5px; font-size: 20px; }

        .card-header p { margin: 0; color: #777; font-size: 13px; }

        .loader-count { min-width: 25px; height: 25px; padding: 0 7px; border-radius: 20px; background: #222; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; }

        .loading { padding: 40px 0; text-align: center; color: #666; }

        .empty-state { padding: 40px 20px; text-align: center; border-top: 1px solid #eee; }

        .empty-state h3 { margin-bottom: 8px; }

        .empty-state p { margin: 0; color: #777; }

        .loaders-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }

        .loaders-grid .loader-row:last-child:nth-child(odd) { grid-column: 1 / -1; }

        .loader-row { padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fff; box-sizing: border-box; }

        .loader-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; margin-bottom: 20px; }

        .loader-name { display: flex; align-items: center; gap: 10px; min-width: 0; }

        .loader-avatar { width: 42px; height: 42px; border-radius: 50%; background: #222; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: bold; flex-shrink: 0; }

        .loader-name h3 { margin: 0 0 3px; font-size: 18px; word-break: break-word; }

        .loader-id { font-size: 11px; color: #777; font-weight: 600; }

        .status-badge { padding: 5px 9px; border-radius: 5px; font-size: 11px; font-weight: bold; flex-shrink: 0; }

        .status-badge.pending { background: #fef3c7; color: #92400e; }

        .status-badge.verified { background: #222; color: #fff; }

        .status-badge.rejected { background: #eee; color: #666; }

        .section-title { font-size: 13px; font-weight: 700; margin-bottom: 10px; color: #333; }

        .company-title { margin-top: 22px; }

        .loader-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 20px; }

        .detail-item { display: flex; flex-direction: column; gap: 4px; min-width: 0; }

        .detail-item span { font-size: 12px; color: #777; }

        .detail-item strong { font-size: 14px; color: #222; word-break: break-word; }

        .loader-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 22px; padding-top: 14px; border-top: 1px solid #eee; }

        .loader-footer span { font-size: 12px; color: #777; }

        .loader-footer strong { font-size: 13px; color: #222; }
      `}</style>
    </div>
  );
}

export default Loaders;
