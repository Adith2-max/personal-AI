
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';

interface AppContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as Theme) || Theme.LIGHT;
        }
        return Theme.LIGHT;
    });
    
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === Theme.DARK) {
            root.classList.add('dark');
            localStorage.setItem('theme', Theme.DARK);
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', Theme.LIGHT);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <AppContext.Provider value={{ theme, setTheme, isLoggedIn, setIsLoggedIn }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
