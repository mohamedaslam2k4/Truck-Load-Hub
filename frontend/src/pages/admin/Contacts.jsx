import { useEffect, useState } from "react";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);


  // get fetch  pending contact request 
  const fetchContacts = async () => {
    setLoading(true);

    try {
      const response = await fetch( "http://127.0.0.1:8000/admin/contacts");
      const data = await response.json();

      if (!response.ok) {
        throw new Error( data.detail || "Failed to fetch contact requests" );
      }

      setContacts(data);

    } catch (error) {
      console.error( "Error fetching contacts:",error);
      alert("Unable to load contact requests");

    } finally { setLoading(false);}};

  useEffect(() => {
    fetchContacts();
  }, []);

  const resolveContact = async (contactId) => {
    setResolvingId(contactId);

    try {
      const response = await fetch( `http://127.0.0.1:8000/admin/contacts/${contactId}/resolve`,
        {
          method: "PUT",
        });

      const data = await response.json();

      if (!response.ok) { throw new Error(data.detail || "Failed to resolve contact");}
      
      // chnage status pending => closed
     
      setContacts((currentContacts) =>currentContacts.filter((contact) => contact.id !== contactId));
      alert("Contact marked as resolved.");

    } catch (error) {
      console.error( "Error resolving contact:", error );
      alert( error.message || "Failed to resolve contact" );

    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div role="ADMIN">
      <div className="contacts-page">

        <div className="page-header">
          <div>
            <h1>Contacts</h1>
            <p>Manage user questions and support requests.</p>
          </div>
        </div>

        <div className="contacts-card">
          <div className="card-header">

            <div>
              <h2>Contact Requests</h2>
              <p>{contacts.length} requests received</p>
            </div>

            <span className="contact-count">{contacts.length}</span>

          </div>
          
          {/*Loading*/}
          {loading && (<div className="loading">Loading contact requests...</div>)}


          {/* when no data it show empty  */}
          {!loading && contacts.length === 0 && (
            <div className="empty-state">
              <h3>No Contact Requests</h3>
              <p>There are no pending support requests.</p>
            </div>)}


          {/* when data show templte */}
          {!loading && contacts.map((contact) => (

            <div className="contact-row" key={contact.id}>
              <div className="contact-info">
                <div className="contact-header">

                  <div>
                    <div className="contact-name">
                      <h3>{contact.name}</h3>
                      <span className="status pending">{contact.status}</span>
                    </div>
                    <p className="subject">Contact Request</p>
                  </div>
                  <span className="date">Date: {contact.createdAt}</span>
                </div>

         
                <div className="details">
                  <p><strong>Email:</strong> {contact.email}</p>
                  <p><strong>Phone:</strong> {contact.phone || "Not provided"}</p>
                </div>

      
                <div className="message">
                  <span>Message</span>
                  <p>{contact.message}</p>
                </div>
              </div>

     
              <div className="actions">
                <button className="resolve" onClick={() => resolveContact(contact.id)} disabled={resolvingId === contact.id}>
                  {resolvingId === contact.id ? "Resolving..." : "Mark Resolved"}
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .contacts-page {
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

        .contacts-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
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

        .contact-count {
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
          padding: 30px 0;
          text-align: center;
          color: #666;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          border-top: 1px solid #eee;
        }

        .empty-state h3 {
          margin-bottom: 8px;
        }

        .empty-state p {
          margin: 0;
          color: #777;
        }

        .contact-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 22px 0;
          border-top: 1px solid #eee;
        }

        .contact-info {
          flex: 1;
        }

        .contact-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          gap: 20px;
          margin-bottom: 12px;
        }

        .contact-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .contact-name h3 {
          margin: 0;
          font-size: 18px;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
        }

        .status.pending {
          background: #222;
          color: #fff;
        }

        .subject {
          margin: 7px 0 0;
          font-weight: 600;
          color: #333;
          font-size: 15px;
        }

        .date {
          color: #777;
          font-size: 13px;
          white-space: nowrap;
        }

        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px 30px;
        }

        .details p {
          margin: 4px 0;
          color: #666;
          font-size: 14px;
        }

        .message {
          margin-top: 14px;
          padding: 12px;
          background: #f7f7f7;
          border-radius: 6px;
        }

        .message span {
          display: block;
          margin-bottom: 5px;
          color: #777;
          font-size: 12px;
          font-weight: 600;
        }

        .message p {
          margin: 0;
          color: #555;
          font-size: 14px;
          line-height: 1.5;
        }

        .actions {
          flex-shrink: 0;
          margin:auto;
        }

        .resolve {
          padding: 9px 16px;
          border: 1px solid #222;
          border-radius: 6px;

          background: #222;
          color: #fff;

          font-size: 14px;
          font-weight: 600;

          cursor: pointer;
        }

        .resolve:hover {
          background: #444;
        }

        .resolve:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

      `}</style>

    </div>
  );
}

export default Contacts;