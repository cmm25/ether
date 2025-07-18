"use client"
import React, { useState } from 'react';
import Image from 'next/image';

interface UserData {
  username: string;
  displayName: string;
  handle: string;
  walletAddress: string;
  ensName?: string;
  bio: string;
  joinedDate: string;
  totalWorks: number;
  approvedWorks: number;
  totalCollections: number;
  followers: number;
  following: number;
  verified: boolean;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

interface ProfileHeaderProps {
  userData: UserData;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData }) => {
  const [copied, setCopied] = useState(false);

  const copyWalletAddress = async () => {
    try {
      await navigator.clipboard.writeText(userData.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy wallet address');
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      {/* Cover/Background */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl" />
      </div>

      {/* Profile Content */}
      <div className="relative -mt-24 md:-mt-36 lg:-mt-40 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-gray-900/50 backdrop-blur-sm">
                <span className="text-white text-6xl md:text-7xl lg:text-8xl font-bold">
                  {userData.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-4 right-4 w-10 h-10 bg-green-500 rounded-full border-4 border-gray-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4 pb-6">
              {/* Name and Handle */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {userData.username}
                  </h1>
                  {userData.verified && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center" title="Verified">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-lg text-gray-300">{userData.displayName}</p>
                <p className="text-indigo-400 font-medium">{userData.handle}</p>
              </div>

              {/* Bio */}
              <p className="text-gray-300 max-w-2xl leading-relaxed">
                {userData.bio}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{userData.followers.toLocaleString()}</span>
                  <span className="text-gray-400">Followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{userData.following.toLocaleString()}</span>
                  <span className="text-gray-400">Following</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400">Joined {userData.joinedDate}</span>
                </div>
              </div>

              {/* Wallet and Social Links */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Wallet Address */}
                <div className="flex items-center gap-2 bg-gray-900/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="font-mono text-sm text-gray-300">
                      {userData.ensName || formatWalletAddress(userData.walletAddress)}
                    </span>
                  </div>
                  <button
                    onClick={copyWalletAddress}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                    title="Copy wallet address"
                  >
                    {copied ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2">
                  {userData.socialLinks.twitter && (
                    <a
                      href={userData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-900/50 hover:bg-blue-600/20 rounded-lg border border-gray-800/50 hover:border-blue-500/50 transition-all"
                      title="Twitter"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  {userData.socialLinks.instagram && (
                    <a
                      href={userData.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-900/50 hover:bg-pink-600/20 rounded-lg border border-gray-800/50 hover:border-pink-500/50 transition-all"
                      title="Instagram"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529l1.529-1.297c.447.596 1.148.894 1.676.894.745 0 1.297-.447 1.297-1.148 0-.596-.447-1.148-1.297-1.148H7.301V11.54h1.148c.745 0 1.297-.447 1.297-1.148 0-.596-.447-1.148-1.297-1.148-.596 0-1.148.298-1.529.745L5.691 8.692c.745-.894 1.896-1.529 3.205-1.529 2.297 0 4.146 1.849 4.146 4.146 0 1.148-.447 2.148-1.297 2.745.894.596 1.297 1.596 1.297 2.745 0 2.297-1.849 4.146-4.146 4.146l-.447.043zm7.703-2.297h-1.529v-1.529h1.529v1.529zm0-3.205h-1.529V9.957h1.529v1.529z"/>
                      </svg>
                    </a>
                  )}
                  {userData.socialLinks.website && (
                    <a
                      href={userData.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-900/50 hover:bg-gray-600/20 rounded-lg border border-gray-800/50 hover:border-gray-500/50 transition-all"
                      title="Website"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pb-6">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
              <button className="bg-gray-900/50 hover:bg-gray-800/50 text-white px-6 py-3 rounded-lg font-medium transition-all border border-gray-800/50 hover:border-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;