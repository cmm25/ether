"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  className?: string;
  onHomeClick?: () => void;
  onGridClick?: () => void;
  onListClick?: () => void;
  onAccountsClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  onHomeClick,
  onGridClick,
  onListClick,
  onAccountsClick,
}) => {
  const router = useRouter();
  return (
    <div className={`w-20 h-screen bg-[#121212] flex flex-col items-center py-5 shadow-2xl fixed left-0 top-0 z-50 ${className}`}>
      {/* Logo/Brand Icon */}
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center mb-10 relative">
        <div className="w-5 h-5 bg-white rounded transform rotate-45"></div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-5 flex-1 justify-center">
        {/* Home Icon */}
        <button
          className="w-12 h-12 bg-transparent border-none rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          title="Home"
          onClick={() => {
            router.push('/');
            onHomeClick?.();
          }}
          aria-label="Home"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>

        {/* Grid Icon */}
        <button
          className="w-12 h-12 bg-transparent border-none rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          title="Discover"
          onClick={onGridClick}
          aria-label="Grid view"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
          </svg>
        </button>

        {/* List Icon */}
        <button
          className="w-12 h-12 bg-transparent border-none rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          title="List"
          onClick={onListClick}
          aria-label="List view"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
          </svg>
        </button>

        {/* Account Icon */}
        <button
          className="w-12 h-12 bg-transparent border-none rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          title="Account"
          onClick={() => {
            router.push('/accounts');
            onAccountsClick?.();
          }}
          aria-label="Account"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </div>

      {/* Beta Badge */}
      <div className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-3 py-1.5 rounded-2xl text-xs font-semibold uppercase tracking-wider mt-auto shadow-lg shadow-red-400/30">
        Beta
      </div>
    </div>
  );
};

export default Sidebar;