import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Bell, ClipboardList, Calendar, Users, Wrench, CreditCard, Info } from 'lucide-react';

const TYPE_ICONS = {
  notice: ClipboardList,
  booking: Calendar,
  visitor: Users,
  maintenance: Wrench,
  payment: CreditCard,
  system: Info
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = () =>
    API.get('/notifications')
      .then((res) => setNotifications(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClick = async (n) => {
    if (!n.isRead) {
      await API.patch(`/notifications/${n._id}/read`);
      fetchNotifications();
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    await API.patch('/notifications/read-all');
    fetchNotifications();
  };

  if (loading) return <p className="page-container">Loading notifications...</p>;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <h2>Notifications</h2>
        <button type="button" onClick={handleMarkAll}>
          Mark All Read
        </button>
      </div>
      {notifications.length === 0 && <p>No notifications yet.</p>}
      {notifications.map((n) => {
        const IconComponent = TYPE_ICONS[n.type] || Bell;
        return (
          <div
            key={n._id}
            className={`notif-item ${n.isRead ? 'read' : 'unread'}`}
            onClick={() => handleClick(n)}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(n)}
            role="button"
            tabIndex={0}
          >
            <span className="notif-icon-wrap">
              <IconComponent className="w-5 h-5 text-indigo-600" />
            </span>
            <div>
              <p>
                <strong>{n.title}</strong>
              </p>
              <p>{n.message}</p>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationsPage;
