import React from 'react';
import { AccountTab } from '../../types/accounts';

interface AccountFilterProps {
  selectedTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
}

const tabs: AccountTab[] = ['Submitted Works', 'Approved NFTs', 'Collections'];

const AccountFilter: React.FC<AccountFilterProps> = ({ selectedTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            selectedTab === tab
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
};

export default AccountFilter;