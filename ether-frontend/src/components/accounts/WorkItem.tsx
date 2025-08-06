import React from 'react';
import Image from 'next/image';
import { WorkItem as WorkItemType, AccountTab } from '../../types/accounts';

interface WorkItemProps {
  item: WorkItemType;
  index: number;
  tab: AccountTab;
  viewMode?: 'grid' | 'list';
}

const WorkItem: React.FC<WorkItemProps> = ({ item, index, tab, viewMode = 'grid' }) => {
  const getStatusBadge = () => {
    if (tab === 'Approved NFTs') {
      return (
        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          Approved
        </div>
      );
    }
    
    switch (item.status) {
      case 'pending':
        return (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            Pending
          </div>
        );
      case 'approved':
        return (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  const getGridSpan = () => {
    // Similar logic to gallery items for varied layouts
    if (index % 7 === 0) return 'md:col-span-2 md:row-span-2';
    if (index % 11 === 0) return 'md:col-span-2';
    if (index % 13 === 0) return 'md:row-span-2';
    return '';
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 hover:border-gray-700 p-4 cursor-pointer transition-all">
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white truncate">{item.title}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                {tab === 'Approved NFTs' && item.price && (
                  <span className="font-medium text-green-400">
                    {item.price} ETH
                  </span>
                )}
                {/* Status Badge */}
                {item.status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer transition-all ${viewMode === 'grid' ? getGridSpan() : ''}`}>
      <div className="relative w-full h-full">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Status Badge */}
        {getStatusBadge()}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-semibold text-lg mb-1 truncate">{item.title}</h3>
          <p className="text-sm text-gray-200 mb-3 line-clamp-2">{item.description}</p>
          
          <div className="flex items-center justify-between text-xs">
            <span className="bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-700">
              {item.category}
            </span>
            {tab === 'Approved NFTs' && item.price && (
              <span className="font-medium text-green-400">
                {item.price} ETH
              </span>
            )}
            {tab === 'Submitted Works' && (
              <span className="text-gray-300">
                {new Date(item.submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkItem;