const StatusBadge = ({ status }) => {
  return (
    <span className={`status-pill ${status || ''}`}>
      {status?.toUpperCase()}
    </span>
  );
};

export default StatusBadge;
