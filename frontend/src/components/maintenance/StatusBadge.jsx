const STATUS_STYLES = {
  paid: { background: '#D5F5E3', color: '#1E7A4A', border: '1px solid #1E7A4A' },
  pending: { background: '#FEF9E7', color: '#9A7D0A', border: '1px solid #9A7D0A' },
  overdue: { background: '#FADBD8', color: '#C0392B', border: '1px solid #C0392B' },
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || {};
  return (
    <span
      style={{
        ...style,
        padding: '2px 10px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.85rem',
      }}
    >
      {status?.toUpperCase()}
    </span>
  );
};

export default StatusBadge;
