"use client"
import React, { useState } from 'react';
import AccountFilter from '../components/accounts/AccountFilter';
import WorkItem from '../components/accounts/WorkItem';
import ProfileHeader from '../components/accounts/ProfileHeader';
import { submittedWorks, approvedNfts, collections } from '../data/accountsData';
import { WorkItem as WorkItemType, AccountTab } from '../types/accounts';

const AccountsPage = () => {
  const [selectedTab, setSelectedTab] = useState<AccountTab>('Submitted Works');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getCurrentItems = () => {
    switch (selectedTab) {
      case 'Submitted Works':
        return submittedWorks;
      case 'Approved NFTs':
        return approvedNfts;
      case 'Collections':
        return collections;
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();

  // Mock user data - in a real app this would come from authentication/API
  const userData = {
    username: "ArtistEther",
    displayName: "Digital Artist",
    handle: "@artistether",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8C",
    ensName: "artistether.eth",
    bio: "Digital artist exploring the intersection of technology and creativity. Creating unique NFTs that push the boundaries of digital art.",
    joinedDate: "January 2024",
    totalWorks: submittedWorks.length,
    approvedWorks: approvedNfts.length,
    totalCollections: collections.length,
    followers: 1247,
    following: 892,
    verified: true,
    socialLinks: {
      twitter: "https://twitter.com/artistether",
      instagram: "https://instagram.com/artistether",
      website: "https://artistether.com"
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white min-h-screen">
      {/* Profile Header */}
      <ProfileHeader userData={userData} />

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <AccountFilter 
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
            />
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="List View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Stats Summary */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
              <div className="text-2xl font-bold text-white">{currentItems.length}</div>
              <div className="text-sm text-gray-400">{selectedTab}</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
              <div className="text-2xl font-bold text-green-400">
                {selectedTab === 'Approved NFTs' ? `${currentItems.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(1)} ETH` : '—'}
              </div>
              <div className="text-sm text-gray-400">Total Value</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
              <div className="text-2xl font-bold text-blue-400">{userData.followers}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
              <div className="text-2xl font-bold text-purple-400">{userData.totalCollections}</div>
              <div className="text-sm text-gray-400">Collections</div>
            </div>
          </div>

          {/* Works Grid/List */}
          {currentItems.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid auto-rows-[200px] gap-4 md:gap-6 grid-cols-1 md:grid-cols-4 lg:grid-cols-6"
                : "space-y-4"
            }>
              {currentItems.map((item, index) => (
                <WorkItem 
                  key={`${selectedTab}-${item.id}`}
                  item={item} 
                  index={index}
                  tab={selectedTab}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-800">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No {selectedTab.toLowerCase()} yet
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {selectedTab === 'Submitted Works' 
                  ? 'Start your creative journey by submitting your first artwork to the platform.' 
                  : selectedTab === 'Approved NFTs'
                  ? 'Your approved artworks will appear here once they become NFTs.'
                  : 'Create your first collection to organize your NFTs.'
                }
              </p>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
                {selectedTab === 'Submitted Works' ? 'Submit Artwork' : 'Create Collection'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccountsPage;