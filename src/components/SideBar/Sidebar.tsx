"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { useActiveWallet } from 'thirdweb/react';

interface SidebarProps {
  className?: string;
  onHomeClick?: () => void;
  onSubmitClick?: () => void;
  onCampaignsClick?: () => void;
  onNotificationsClick?: () => void;
  onAccountsClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  onHomeClick,
  onSubmitClick,
  onCampaignsClick,
  onNotificationsClick,
  onAccountsClick,
}) => {
  const router = useRouter();
  const activeWallet = useActiveWallet();

  const handleLogout = async () => {
    try {
      if (activeWallet) {
        await activeWallet.disconnect();
      }
      router.push('/');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // Still redirect even if disconnect fails
      router.push('/');
    }
  };
  return (
    <div className={`w-24 h-screen bg-[#121212] flex flex-col items-center py-5 shadow-2xl fixed left-0 top-0 z-50 ${className}`}>
      {/* Logo/Brand Icon */}
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center mb-10 relative">
        <div className="w-5 h-5 bg-white rounded transform rotate-45"></div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-5 flex-1 justify-center">
        {/* Home - Gallery/Minted NFTs */}
        <button
          className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
          title="Gallery"
          onClick={() => {
            router.push('/');
            onHomeClick?.();
          }}
          aria-label="Gallery"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
            <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
          </svg>
        </button>

        {/* Submit Artwork */}
        <button
          className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
          title="Submit Artwork"
          onClick={() => {
            router.push('/submit-artwork');
            onSubmitClick?.();
          }}
          aria-label="Submit Artwork"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>

        {/* Campaigns & Voting */}
        <button
          className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
          title="Campaigns"
          onClick={() => {
            router.push('/campaigns');
            onCampaignsClick?.();
          }}
          aria-label="Campaigns"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
            <path d="M9 11H7v9h2v-9zm4-4H11v13h2V7zm4-4H15v17h2V3z" />
          </svg>
        </button>

        {/* Notifications */}
        <button
          className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
          title="Notifications"
          onClick={() => {
            router.push('/notifications');
            onNotificationsClick?.();
          }}
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
          </svg>
        </button>

        {/* User Profile - Last */}
        <button
          className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
          title="Profile"
          onClick={() => {
            router.push('/accounts');
            onAccountsClick?.();
          }}
          aria-label="Profile"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>
      </div>

      {/* Logout Button - Bottom */}
      <button
        className="w-14 h-14 bg-transparent border-2 border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-400 hover:border-red-500 hover:text-red-400 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 group"
        title="Logout"
        onClick={handleLogout}
        aria-label="Logout"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current transition-transform duration-300 group-hover:scale-110">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
        </svg>
      </button>
    </div>
  );
};

export default Sidebar;