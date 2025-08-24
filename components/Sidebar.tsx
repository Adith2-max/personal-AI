
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Theme } from '../types';
import { ChatIcon, ImageIcon, SearchIcon, SettingsIcon, LogoutIcon, SunIcon, MoonIcon } from '../constants';

interface SidebarProps {
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const NavItem: React.FC<{ to: string; isCollapsed: boolean; children: React.ReactNode }> = ({ to, isCollapsed, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-primary-dark text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`
        }
    >
        {children}
    </NavLink>
);

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setCollapsed }) => {
    const { theme, setTheme, setIsLoggedIn } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsLoggedIn(false);
        navigate('/login');
    };

    const toggleTheme = () => {
        setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    };

    const navItems = [
        { to: '/chat', icon: ChatIcon, label: 'Chat' },
        { to: '/image', icon: ImageIcon, label: 'Image' },
        { to: '/search', icon: SearchIcon, label: 'Search' },
        { to: '/settings', icon: SettingsIcon, label: 'Settings' },
    ];

    return (
        <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
                    <h1 className={`text-2xl font-bold text-primary-dark dark:text-primary-light transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        {isCollapsed ? '' : 'Zyra'}
                    </h1>
                </div>

                <nav className="flex-1 px-3 py-4">
                    {navItems.map(item => (
                        <NavItem key={item.to} to={item.to} isCollapsed={isCollapsed}>
                            <item.icon className="h-6 w-6" />
                            <span className={`ml-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{item.label}</span>
                        </NavItem>
                    ))}
                </nav>

                <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={toggleTheme} className="flex items-center p-3 my-1 w-full rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                        {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                        <span className={`ml-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center p-3 my-1 w-full rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                        <LogoutIcon className="h-6 w-6" />
                        <span className={`ml-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Logout</span>
                    </button>
                </div>
                <button onClick={() => setCollapsed(!isCollapsed)} className="absolute -right-3 top-20 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-full p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
