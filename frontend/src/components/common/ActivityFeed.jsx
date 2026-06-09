import { useState } from 'react';
import { 
  ShieldAlert, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

const PRIORITY_LEVELS = ['All', 'Critical', 'High', 'Medium', 'Low'];

const getPriorityDetails = (priority = 'normal') => {
  const p = String(priority).toLowerCase();
  if (p === 'emergency' || p === 'critical' || p === 'urgent') {
    return { label: 'Critical', tone: 'critical', icon: ShieldAlert };
  }
  if (p === 'important' || p === 'high') {
    return { label: 'High', tone: 'high', icon: AlertCircle };
  }
  if (p === 'normal' || p === 'medium') {
    return { label: 'Medium', tone: 'medium', icon: Info };
  }
  return { label: 'Low', tone: 'low', icon: CheckCircle2 };
};

const getActionIcon = (action = '') => {
  const a = action.toLowerCase();
  if (a.includes('approve') || a.includes('resolve') || a.includes('pay') || a.includes('paid')) {
    return CheckCircle2;
  }
  if (a.includes('check-in') || a.includes('check in') || a.includes('joined') || a.includes('invite')) {
    return User;
  }
  if (a.includes('delete') || a.includes('reject') || a.includes('remove') || a.includes('alert') || a.includes('emergency')) {
    return ShieldAlert;
  }
  if (a.includes('update') || a.includes('change') || a.includes('edit')) {
    return Clock;
  }
  if (a.includes('booking') || a.includes('event') || a.includes('calendar')) {
    return Calendar;
  }
  return Info;
};

const ActivityFeed = ({ 
  activities = [], 
  loading = false, 
  emptyTitle = 'No recent activity', 
  emptyMessage = 'Activities and community updates will be logged here.',
  emptyAction = null
}) => {
  const [filterPriority, setFilterPriority] = useState('All');

  // Filter logic
  const filteredActivities = activities.filter((act) => {
    if (filterPriority === 'All') return true;
    const details = getPriorityDetails(act.priority);
    return details.label === filterPriority;
  });

  return (
    <div className="activity-feed-wrapper">
      {/* Priority Filters */}
      {activities.length > 0 && (
        <div className="activity-feed-filters" role="tablist" aria-label="Activity Priority Filters">
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginRight: '4px' }}>
            Filter Priority:
          </span>
          {PRIORITY_LEVELS.map((lvl) => (
            <button
              key={lvl}
              role="tab"
              aria-selected={filterPriority === lvl}
              className={`activity-filter-btn ${filterPriority === lvl ? 'is-active' : ''}`}
              onClick={() => setFilterPriority(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        // Skeleton items
        <div className="activity-timeline">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="activity-timeline-item">
              <div className="activity-timeline-marker" />
              <div className="activity-timeline-card">
                <div className="skeleton-box skeleton-title" style={{ width: '40%' }} />
                <div className="skeleton-box skeleton-text" style={{ width: '80%' }} />
                <div className="skeleton-box skeleton-meta" style={{ width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        // Empty State
        <div className="modern-empty-state">
          <FolderOpen className="modern-empty-state-icon" />
          <h4>{emptyTitle}</h4>
          <p>
            {filterPriority === 'All' 
              ? emptyMessage 
              : `There are currently no activities matching the "${filterPriority}" priority level.`}
          </p>
          {emptyAction}
        </div>
      ) : (
        // Timeline Feed
        <ol className="activity-timeline" aria-label="Recent activity timeline">
          {filteredActivities.map((act) => {
            const priority = getPriorityDetails(act.priority);
            const PriorityIcon = priority.icon;
            const ActionIcon = getActionIcon(act.action);

            return (
              <li 
                key={act._id} 
                className={`activity-timeline-item priority-${priority.tone}`}
                tabIndex={0}
                aria-label={`Activity by ${act.actor || 'System'}: ${act.action}. Status: ${act.status || 'N/A'}. Priority: ${priority.label}`}
              >
                <div className="activity-timeline-marker" title={`Priority: ${priority.label}`}>
                  <PriorityIcon size={10} style={{ color: 'inherit' }} aria-hidden="true" />
                </div>
                
                <div className="activity-timeline-card">
                  <div className="activity-item-header">
                    <span className="activity-item-actor">{act.actor || 'System'}</span>
                    <span className="activity-item-time">
                      {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  
                  <p className="activity-item-action">{act.action}</p>
                  
                  <div className="activity-item-meta">
                    <span>
                      Status: <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                        {String(act.status || 'Completed').replace('_', ' ')}
                      </strong>
                    </span>
                    <span className={`activity-badge tone-${priority.tone}`}>
                      <PriorityIcon size={12} style={{ marginRight: '2px' }} />
                      {priority.label}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default ActivityFeed;
