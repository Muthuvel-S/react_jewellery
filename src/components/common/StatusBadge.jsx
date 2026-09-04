import React from 'react';

export default function StatusBadge({ status, variant, size = 'sm', icon: Icon, children }) {
  const text = children || status || '';
  const normalized = String(text).toUpperCase().trim();

  let determinedVariant = variant;
  if (!determinedVariant) {
    if (['ACTIVE', 'PAID', 'COMPLETED', 'AVAILABLE', 'APPROVED', 'INWARD', 'SETTLED', 'TRUE', 'YES', 'GOOD'].includes(normalized)) {
      determinedVariant = 'success';
    } else if (['PENDING', 'LOW STOCK', 'PROCESSING', 'PARTIAL', 'STANDBY', 'DRAFT', 'WARNING'].includes(normalized)) {
      determinedVariant = 'warning';
    } else if (['OUT OF STOCK', 'INACTIVE', 'CANCELLED', 'REJECTED', 'DELETED', 'OUTWARD', 'ERROR', 'FALSE', 'NO'].includes(normalized)) {
      determinedVariant = 'danger';
    } else if (['GOLD', '22K', '24K', '916', '999'].includes(normalized)) {
      determinedVariant = 'gold';
    } else if (['SILVER', '925', '99.9'].includes(normalized)) {
      determinedVariant = 'silver';
    } else {
      determinedVariant = 'neutral';
    }
  }

  return (
    <span className={`status-badge badge-${determinedVariant} badge-${size}`}>
      {Icon ? <Icon size={size === 'xs' ? 10 : 12} className="badge-icon" /> : <span className="badge-dot" />}
      <span>{text}</span>
    </span>
  );
}
