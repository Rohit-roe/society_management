import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');
const renderIcon = (icon, className = 'dashboard-icon') => {
  if (!icon) return null;
  if (typeof icon === 'string' || typeof icon === 'number') {
    return icon;
  }
  const IconComponent = icon;
  return <IconComponent className={className} aria-hidden="true" />;
};

export const DashboardPage = ({ children, className = '' }) => (
  <section className={joinClasses('dashboard-page', className)}>{children}</section>
);

export const DashboardHeader = ({ title, subtitle, summary, actions, className = '' }) => (
  <header className={joinClasses('dashboard-header', className)}>
    <div>
      <p className="dashboard-eyebrow">Dashboard</p>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {(summary || actions) && (
      <div className="dashboard-header-aside">
        {summary}
        {actions}
      </div>
    )}
  </header>
);

export const DashboardKpiGrid = ({ children, className = '' }) => (
  <div className={joinClasses('dashboard-kpi-grid', className)}>{children}</div>
);

export const DashboardKpiCard = ({ label, value, helper, icon = 'i', tone = 'default' }) => (
  <article
    className={joinClasses('dashboard-kpi-card', `tone-${tone}`)}
    aria-label={`${label}: ${value}`}
  >
    <div className="dashboard-kpi-icon" aria-hidden="true">
      {renderIcon(icon)}
    </div>
    <div>
      <h3>{label}</h3>
      <strong>{value}</strong>
      {helper && <p>{helper}</p>}
    </div>
  </article>
);

export const DashboardSection = ({
  title,
  description,
  children,
  actions,
  icon,
  priority = 'normal',
  className = '',
}) => (
  <section className={joinClasses('dashboard-section', `priority-${priority}`, className)}>
    <div className="dashboard-section-header">
      <div>
        <h3>
          {icon && <span className="dashboard-section-icon">{renderIcon(icon)}</span>}
          {title}
        </h3>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="dashboard-section-actions">{actions}</div>}
    </div>
    {children}
  </section>
);

export const DashboardCard = ({ children, className = '', emphasis = 'normal' }) => (
  <article className={joinClasses('dashboard-card', `emphasis-${emphasis}`, className)}>{children}</article>
);

export const DashboardActionGrid = ({ children, className = '' }) => (
  <div className={joinClasses('dashboard-action-grid', className)}>{children}</div>
);

export const DashboardActionLink = ({ to, icon = '->', title, description, className = '' }) => (
  <Link to={to} className={joinClasses('dashboard-action-link', className)}>
    <span className="dashboard-action-icon" aria-hidden="true">
      {renderIcon(icon)}
    </span>
    <span>
      <strong>{title}</strong>
      {description && <small>{description}</small>}
    </span>
  </Link>
);

export const DashboardEmptyState = ({ title = 'Nothing pending', message, action }) => (
  <div className="dashboard-empty-state">
    <span aria-hidden="true">
      <Info className="dashboard-icon" />
    </span>
    <div>
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action}
    </div>
  </div>
);

export const DashboardStatusBadge = ({ children, tone = 'neutral', icon, className = '' }) => (
  <span className={joinClasses('dashboard-status-badge', `tone-${tone}`, className)}>
    {icon && renderIcon(icon, 'dashboard-status-icon')}
    {children}
  </span>
);

/* ============================================================
   SKELETON LOADER COMPONENTS
   Matching the visual shape of their dashboard counterparts.
   All use .skeleton-box shimmer animation from index.css.
   ============================================================ */

/**
 * DashboardKpiSkeleton
 * Renders `count` shimmer placeholders in the same grid as DashboardKpiGrid.
 */
export const DashboardKpiSkeleton = ({ count = 4 }) => (
  <div className="skeleton-kpi-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-kpi-card">
        <div className="skeleton-box skeleton-kpi-icon" />
        <div className="skeleton-kpi-content">
          <div className="skeleton-box skeleton-card-row" style={{ width: '55%' }} />
          <div className="skeleton-box skeleton-card-row" style={{ width: '38%', height: 26 }} />
          <div className="skeleton-box skeleton-card-row" style={{ width: '70%', height: 10 }} />
        </div>
      </div>
    ))}
  </div>
);

/**
 * DashboardCardSkeleton
 * Renders a single shimmer card with `rows` placeholder text lines.
 */
export const DashboardCardSkeleton = ({ rows = 3, showTitle = true }) => (
  <div className="skeleton-section">
    {showTitle && <div className="skeleton-box skeleton-section-header" />}
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="skeleton-box skeleton-card-row"
        style={{ width: i % 3 === 0 ? '90%' : i % 3 === 1 ? '72%' : '55%' }}
      />
    ))}
  </div>
);

/**
 * DashboardTableSkeleton
 * Renders a shimmer table header + `rows` shimmer data rows.
 */
export const DashboardTableSkeleton = ({ rows = 5 }) => (
  <div className="skeleton-section">
    <div className="skeleton-box skeleton-table-header" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton-box skeleton-table-row-item" />
    ))}
  </div>
);
