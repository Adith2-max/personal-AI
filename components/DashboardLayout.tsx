
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
