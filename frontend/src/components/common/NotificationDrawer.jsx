import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Bell, 
  ClipboardList, 
  Wrench, 
  MessageSquare, 
  Users, 
  FileText, 
  TrendingUp, 
  Vote, 
  Calendar, 
  ShieldAlert, 
  AlertCircle, 
  Info, 
  CheckCircle2,
  Inbox
} from 'lucide-react';
import API from '../../api/axios';
import { useSocket } from '../../context/SocketContext';

const CATEGORIES = [
  'All',
  'Notices',
  'Maintenance',
  'Complaints',
  'Visitor Activity',
  'Resident Requests',
  'Society Requests',
  'Polls',
  'Events',
  'Security Alerts'
];

const CATEGORY_ICONS = {
  'Notices': ClipboardList,
  'Maintenance': Wrench,
  'Complaints': MessageSquare,
  'Visitor Activity': Users,
  'Resident Requests': FileText,
  'Society Requests': TrendingUp,
  'Polls': Vote,
  'Events': Calendar,
  'Security Alerts': ShieldAlert
};

const getNotificationCategory = (n) => {
  const title = n.title?.toLowerCase() || '';
  const message = n.message?.toLowerCase() || '';
  const priority = n.priority?.toLowerCase() || '';
  const type = n.type?.toLowerCase() || '';

  // 1. Security Alerts (Critical/Emergency priority, or mentions emergency)
  if (
    priority === 'critical' || 
    priority === 'emergency' || 
    title.includes('emergency') || 
    title.includes('security alert') || 
    message.includes('emergency')
  ) {
    return 'Security Alerts';
  }
  // 2. Polls
  if (
    type === 'notice' && 
    (title.includes('poll') || title.includes('vote') || message.includes('poll') || message.includes('vote'))
  ) {
    return 'Polls';
  }
  // 3. Events
  if (
    type === 'event' || 
    title.includes('event') || 
    title.includes('celebration') || 
    message.includes('event')
  ) {
    return 'Events';
  }
  // 4. Visitor Activity
  if (
    type === 'visitor' || 
    title.includes('visitor') || 
    title.includes('guest') || 
    message.includes('visitor')
  ) {
    return 'Visitor Activity';
  }
  // 5. Maintenance
  if (
    type === 'maintenance' || 
    type === 'payment' || 
    title.includes('maintenance') || 
    title.includes('dues') || 
    title.includes('invoice') || 
    title.includes('bill')
  ) {
    return 'Maintenance';
  }
  // 6. Complaints
  if (
    type === 'complaint' || 
    title.includes('complaint') || 
    title.includes('ticket')
  ) {
    return 'Complaints';
  }
  // 7. Resident Requests
  if (
    title.includes('resident request') || 
    title.includes('family member') || 
    title.includes('pre-approve') || 
    title.includes('joined') ||
    message.includes('resident request') ||
    message.includes('family member')
  ) {
    return 'Resident Requests';
  }
  // 8. Society Requests
  if (
    title.includes('society request') || 
    title.includes('withdrawal') || 
    title.includes('wallet') ||
    message.includes('society request') ||
    message.includes('withdrawal')
  ) {
    return 'Society Requests';
  }
  // 9. Notices
  if (type === 'notice') {
    return 'Notices';
  }
  
  // Fallback category
  return 'Notices';
};

const getPriorityDetails = (priority = 'normal') => {
  const p = priority.toLowerCase();
  if (p === 'emergency' || p === 'critical') {
    return { label: 'Critical', tone: 'critical', icon: ShieldAlert };
  }
  if (p === 'important') {
    return { label: 'High', tone: 'high', icon: AlertCircle };
  }
  if (p === 'normal') {
    return { label: 'Medium', tone: 'medium', icon: Info };
  }
  return { label: 'Low', tone: 'low', icon: CheckCircle2 };
};

const NotificationDrawer = ({ isOpen, onClose, onRefreshUnread }) => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);

  const fetchNotifications = () => {
    setLoading(true);
    setError('');
    API.get('/notifications')
      .then((res) => {
        setNotifications(res.data);
        if (onRefreshUnread) onRefreshUnread();
      })
      .catch((err) => {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please check your network connection.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      // Focus the close button when drawer opens
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!socket || !isOpen) return undefined;
    const handleNewNotif = () => {
      fetchNotifications();
    };
    socket.on('new_notification', handleNewNotif);
    return () => socket.off('new_notification', handleNewNotif);
  }, [socket, isOpen]);

  // Handle keyboard interaction (close on Escape, trap focus)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex="0"]'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await API.patch(`/notifications/${n._id}/read`);
        // Refresh local items
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
        if (onRefreshUnread) onRefreshUnread();
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    onClose();
    if (n.link) navigate(n.link);
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
      if (onRefreshUnread) onRefreshUnread();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      if (onRefreshUnread) onRefreshUnread();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (!isOpen) return null;

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'All') return true;
    return getNotificationCategory(n) === activeCategory;
  });

  return (
    <>
      <div 
        className="notif-drawer-backdrop" 
        onClick={onClose} 
        aria-hidden="true"
      />
      <div 
        ref={drawerRef}
        className="notif-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Notification Drawer"
      >
        <div className="notif-drawer-header">
          <h3>Notifications</h3>
          <div className="notif-header-actions">
            {notifications.some((n) => !n.isRead) && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleMarkAllRead}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Mark All Read
              </button>
            )}
            <button 
              ref={closeBtnRef}
              type="button" 
              className="notif-drawer-close-btn"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="notif-drawer-categories" role="tablist" aria-label="Notification Categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`notif-category-tab ${activeCategory === cat ? 'is-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Drawer contents */}
        <div className="notif-drawer-content">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="notif-drawer-item" style={{ cursor: 'default' }}>
                <div className="skeleton-box skeleton-avatar" />
                <div className="notif-item-details">
                  <div className="skeleton-box skeleton-title" />
                  <div className="skeleton-box skeleton-text" />
                  <div className="skeleton-box skeleton-meta" />
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="modern-empty-state" style={{ marginTop: '40px' }}>
              <AlertCircle className="modern-empty-state-icon text-[var(--status-danger-text)]" />
              <h4 className="text-[var(--text-primary)]">Failed to load notifications</h4>
              <p className="text-[var(--text-secondary)] text-sm mb-2">{error}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={fetchNotifications}
              >
                Retry
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            // Empty state
            <div className="modern-empty-state" style={{ marginTop: '40px' }}>
              <Inbox className="modern-empty-state-icon" />
              <h4>No notifications here</h4>
              <p>
                {activeCategory === 'All' 
                  ? "You don't have any notifications logged at the moment."
                  : `There are currently no notifications in the "${activeCategory}" category.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const cat = getNotificationCategory(n);
              const IconComp = CATEGORY_ICONS[cat] || Bell;
              const priority = getPriorityDetails(n.priority);
              const PriorityIcon = priority.icon;

              return (
                <div
                  key={n._id}
                  className={`notif-drawer-item ${!n.isRead ? 'is-unread' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleNotificationClick(n);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.title}. ${n.message}. Category: ${cat}. Priority: ${priority.label}`}
                >
                  <div 
                    className="notif-item-icon-wrap"
                    style={{ 
                      background: !n.isRead ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--scrollbar-track)',
                      color: !n.isRead ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <IconComp size={20} aria-hidden="true" />
                  </div>
                  
                  <div className="notif-item-details">
                    <div className="notif-item-title-row">
                      <strong>{n.title}</strong>
                      <span className={`activity-badge tone-${priority.tone}`} aria-hidden="true">
                        <PriorityIcon size={12} style={{ marginRight: '2px' }} />
                        {priority.label}
                      </span>
                    </div>
                    
                    <p className="notif-item-message">{n.message}</p>
                    
                    <div className="notif-item-footer">
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      {!n.isRead && (
                        <button
                          type="button"
                          className="notif-item-mark-read-btn"
                          onClick={(e) => handleMarkAsRead(e, n._id)}
                          aria-label={`Mark "${n.title}" as read`}
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="notif-drawer-footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
