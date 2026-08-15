function Card({ title, value, children }) {

  return (
    <div className="dashboard-card">

      {title && (<h3>{title}</h3>)}

      {value !== undefined && (<div className="card-value">{value}</div>)}

      {children}

      <style>{`
        .dashboard-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 20px;
        }

        .dashboard-card h3 {
          text-align:center;
          margin: 0 0 10px;
          font-size: 15px;
          color: #666;
        }

        .card-value {
          text-align:center;
          font-size: 30px;
          font-weight: 700;
          color: #222;
        }
      `}</style>

    </div>
  );
}

export default Card;