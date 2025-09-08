import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const variantClasses = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div
      className={`p-4 mb-4 border rounded-md flex items-start justify-between ${
        variantClasses[variant]
      } ${className}`}
      role="alert"
    >
      <div>{children}</div>
      {dismissible && onDismiss && (
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 ml-4"
          onClick={onDismiss}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

export default Alert;
