"use client";
import React from 'react';
import { FormFieldProps } from '@/types/profile';

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  type = 'text',
  maxLength,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const baseInputClasses = `
    w-full px-4 py-3 bg-[#1a1a1a] border-2 rounded-xl text-white placeholder-gray-400
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50
    ${error 
      ? 'border-red-500 focus:border-red-500' 
      : 'border-gray-600 focus:border-purple-500 hover:border-gray-500'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          rows={4}
          className={`${baseInputClasses} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}
      
      {maxLength && (
        <div className="flex justify-between text-xs text-gray-500">
          <span></span>
          <span>{value.length}/{maxLength}</span>
        </div>
      )}
      
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;