import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');
const renderIcon = (icon, className = 'dashboard-icon') => {
  if (!icon) return null;
  if (typeof icon === 'function') {
    const Icon = icon;
    return <Icon className={className} aria-hidden="true" />;
  }
  return icon;
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
  <article className={joinClasses('dashboard-kpi-card', `tone-${tone}`)}>
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
