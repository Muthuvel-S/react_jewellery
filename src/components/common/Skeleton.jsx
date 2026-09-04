import React from 'react';

export function Skeleton({ className = '', width, height, borderRadius, style = {} }) {
  const customStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...style
  };

  return <div className={`skeleton-loader ${className}`} style={customStyle} />;
}

export function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="skeleton-table-wrapper">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="18px" width={`${Math.floor(60 + Math.random() * 35)}%`} />
        ))}
      </div>
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="skeleton-table-row">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} height="16px" width={`${Math.floor(50 + Math.random() * 45)}%`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard({ height = '120px' }) {
  return (
    <div className="skeleton-card" style={{ minHeight: height }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Skeleton height="14px" width="40%" />
        <Skeleton height="20px" width="20px" borderRadius="50%" />
      </div>
      <Skeleton height="28px" width="65%" style={{ marginBottom: '8px' }} />
      <Skeleton height="12px" width="80%" />
    </div>
  );
}

export default Skeleton;
