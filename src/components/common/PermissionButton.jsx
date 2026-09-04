import React from 'react';

export default function PermissionButton({
  children,
  permission = true,
  variant = 'primary', // primary | secondary | danger | ghost | icon
  className = '',
  onClick,
  disabled = false,
  title,
  type = 'button',
  size = 'md', // sm | md | lg
  loading = false,
  icon: Icon,
  ...props
}) {
  const isAllowed = Boolean(permission);
  const isDisabled = disabled || !isAllowed || loading;
  const tooltip = title || (!isAllowed ? 'You do not have permission for this action.' : '');

  const baseClass = variant === 'icon' ? 'btn-icon' : `btn btn-${variant} btn-${size}`;
  const combinedClasses = `${baseClass} ${className} ${isDisabled ? 'btn-disabled' : ''}`.trim();

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={isDisabled}
      title={tooltip}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="btn-icon-svg" />
      ) : null}
      {children && <span className="btn-label">{children}</span>}
    </button>
  );
}
