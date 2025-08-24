
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Spinner from '../components/Spinner';
import { ChatIcon } from '../constants';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { setIsLoggedIn } = useApp();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (email && password) {
                setIsLoggedIn(true);
                navigate('/chat');
            } else {
                setError('Please enter both email and password.');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
                <div className="text-center">
                    <div className="inline-block p-4 bg-primary-light rounded-full mb-4">
                         <ChatIcon className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Welcome to Zyra</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Your Personal AI Assistant</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-primary-dark focus:border-primary-dark focus:z-10 sm:text-sm"
                                placeholder="Email address (any)"
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-primary-dark focus:border-primary-dark focus:z-10 sm:text-sm"
                                placeholder="Password (any)"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-dark hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-400 dark:disabled:bg-gray-600"
                        >
                            {isLoading ? <Spinner size="sm" /> : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
