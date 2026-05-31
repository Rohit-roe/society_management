import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import API from '../../api/axios';

const NotificationBell = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  const loadUnread = () => {
    API.get('/notifications').then((res) => {
      setUnread(res.data.filter((n) => !n.isRead).length);
    });
  };

  useEffect(() => {
    loadUnread();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const onNew = () => setUnread((prev) => prev + 1);
    socket.on('new_notification', onNew);
    return () => socket.off('new_notification', onNew);
  }, [socket]);

  return (
    <button
      type="button"
      className="notification-bell-btn"
      onClick={() => navigate('/notifications')}
      aria-label="Notifications"
    >
      🔔
      {unread > 0 && <span className="bell-badge">{unread > 9 ? '9+' : unread}</span>}
    </button>
  );
};

export default NotificationBell;
