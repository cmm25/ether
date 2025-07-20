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
    <div className={`w-24 h-screen bg-[#121212] flex flex-col items-center py-5 shadow-2xl fixed left-0 top-0 z-50 ${className}`}>
      {/* Logo/Brand Icon */}
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center mb-10 relative">
        <div className="w-5 h-5 bg-white rounded transform rotate-45"></div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-5 flex-1 justify-center">
        {/* Home Icon */}
        <button
          className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
          title="Home"
          onClick={() => {
            router.push('/');
            onHomeClick?.();
          }}
          aria-label="Home"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>

        {/* Grid Icon */}
        <button
          className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
          title="Discover"
          onClick={onGridClick}
          aria-label="Grid view"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
            <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
          </svg>
        </button>

        {/* Submit Artwork Icon */}
        <button
          className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
          title="Submit Artwork"
          onClick={() => {
            router.push('/submit-artwork');
            onListClick?.();
          }}
          aria-label="Submit Artwork"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>

        {/* Account Icon */}
        <button
          className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
          title="Account"
          onClick={() => {
            router.push('/accounts');
            onAccountsClick?.();
          }}
          aria-label="Account"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </div>

      {/* Beta Badge */}
      <div className="bg-white text-black border-2 border-white px-3 py-1.5 rounded-2xl text-xs font-semibold uppercase tracking-wider mt-auto shadow-lg shadow-white/20 mx-2">
        Beta
      </div>
    </div>
  );
};

export default Sidebar;