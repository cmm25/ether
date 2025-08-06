"use client";
import React from 'react';

interface PreferenceToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const PreferenceToggle: React.FC<PreferenceToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-medium text-white">{label}</h4>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
      </div>
      
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${checked 
            ? 'bg-purple-600' 
            : 'bg-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};

export default PreferenceToggle;