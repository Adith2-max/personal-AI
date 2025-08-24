
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Theme } from '../types';
import { SunIcon, MoonIcon, MicrophoneIcon } from '../constants';

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useApp();
    const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const getMicrophoneDevices = async () => {
        try {
            // Request permission first
            await navigator.mediaDevices.getUserMedia({ audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
            setMicrophones(audioInputDevices);
            if (audioInputDevices.length === 0) {
                 setPermissionError("No microphone devices found.");
            } else {
                 setPermissionError(null);
            }
        } catch (err) {
            console.error("Error enumerating devices:", err);
            setPermissionError("Microphone access denied. Please enable it in your browser settings to see available devices.");
        }
    };
    
    useEffect(() => {
        // Attempt to get devices on load, but permission might be needed
        getMicrophoneDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTheme = () => {
        setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">Settings</h1>

            <div className="space-y-8">
                {/* Theme Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Appearance</h2>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-700 dark:text-gray-300">Theme</p>
                        <div className="flex items-center space-x-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <button
                                onClick={() => setTheme(Theme.LIGHT)}
                                className={`p-2 rounded-full transition-colors ${theme === Theme.LIGHT ? 'bg-white shadow' : ''}`}
                            >
                                <SunIcon className="h-6 w-6 text-yellow-500" />
                            </button>
                            <button
                                onClick={() => setTheme(Theme.DARK)}
                                className={`p-2 rounded-full transition-colors ${theme === Theme.DARK ? 'bg-gray-800 shadow' : ''}`}
                            >
                                <MoonIcon className="h-6 w-6 text-blue-300" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Microphone Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Audio Devices</h2>
                    <div className="flex items-center text-gray-700 dark:text-gray-300 mb-4">
                        <MicrophoneIcon className="h-6 w-6 mr-3 text-primary-dark dark:text-primary-light" />
                        <p>Detected Microphone(s)</p>
                    </div>

                    {permissionError && (
                         <div className="text-center p-4 border border-yellow-400 bg-yellow-50 dark:bg-gray-700 dark:border-yellow-600 rounded-lg">
                            <p className="text-yellow-700 dark:text-yellow-300">{permissionError}</p>
                             <button onClick={getMicrophoneDevices} className="mt-2 px-4 py-1 bg-primary-dark text-white rounded hover:bg-primary-light">
                                 Request Permission
                             </button>
                         </div>
                    )}

                    {microphones.length > 0 && (
                        <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-400">
                           {microphones.map((mic, index) => (
                               <li key={mic.deviceId}>
                                   {mic.label || `Microphone ${index + 1}`}
                               </li>
                           ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
