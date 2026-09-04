import React from 'react';
import { Sparkles } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Sparkles,
  title = 'No records found',
  description = 'There are no entries available to display at this moment.',
  action,
  compact = false
}) {
  return (
    <div className={`luxury-empty-state ${compact ? 'empty-compact' : ''}`}>
      <div className="empty-icon-wrapper">
        <Icon size={compact ? 24 : 32} />
      </div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
