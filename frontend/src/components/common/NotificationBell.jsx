import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import API from '../../api/axios';
import NotificationDrawer from './NotificationDrawer';

const NotificationBell = () => {
  const socket = useSocket();
  const [unread, setUnread] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadUnread = () => {
    API.get('/notifications')
      .then((res) => {
        setUnread(res.data.filter((n) => !n.isRead).length);
      })
      .catch((err) => console.error('Error fetching unread count:', err));
  };

  useEffect(() => {
    loadUnread();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const onNew = () => {
      setUnread((prev) => prev + 1);
    };
    socket.on('new_notification', onNew);
    return () => socket.off('new_notification', onNew);
  }, [socket]);

  return (
    <>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        aria-label={`Notifications. ${unread} unread.`}
        aria-expanded={isDrawerOpen}
        style={{ position: 'relative' }}
      >
        <Bell className="nav-icon" aria-hidden="true" />
        {unread > 0 && (
          <span className="bell-badge" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefreshUnread={loadUnread}
      />
    </>
  );
};

export default NotificationBell;

