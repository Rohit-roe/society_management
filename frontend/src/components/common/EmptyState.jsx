import React from 'react';

/**
 * EmptyState — Global reusable empty state component.
 * Uses CSS classes exclusively (no inline styles).
 * Supports an optional action button with a proper label for accessibility.
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="modern-empty-state">
      {Icon && <Icon className="modern-empty-state-icon" aria-hidden="true" />}
      {title && <h4>{title}</h4>}
      {description && <p>{description}</p>}
      {actionText && onAction && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAction}
          aria-label={actionText}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
