
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import ChatPage from './pages/ChatPage';
import ImagePage from './pages/ImagePage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';

const AppRoutes: React.FC = () => {
    const { isLoggedIn } = useApp();

    return (
        <Routes>
            {!isLoggedIn ? (
                <>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </>
            ) : (
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/chat" />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="image" element={<ImagePage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/chat" />} />
                </Route>
            )}
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </div>
        </AppProvider>
    );
};

export default App;
