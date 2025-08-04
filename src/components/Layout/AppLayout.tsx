"use client"
import React from 'react';
import Sidebar from '../SideBar/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main content with left margin to account for sidebar */}
      <div className="ml-20">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;