import React, { useState } from 'react';
import { groundedSearch } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../constants';
import { GroundingChunk } from '../types';

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ text: string; sources: GroundingChunk[] } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        if (!navigator.onLine) {
            setError("You are currently offline. Please check your internet connection to use search.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await groundedSearch(query);
            const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];
            setResult({
                text: response.text,
                sources: sources
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Deep Search</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Get synthesized answers powered by Google Search.</p>
            </div>

            <form onSubmit={handleSearch} className="mb-8">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about recent events or anything you want to know..."
                        className="w-full p-4 pl-12 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-dark focus:border-primary-dark transition"
                        disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <SearchIcon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>
            </form>

            {isLoading && (
                <div className="flex justify-center mt-10">
                    <Spinner size="lg" />
                </div>
            )}

            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

            {result && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
                    <h2 className="text-2xl font-bold mb-4">Synthesized Answer</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{result.text}</p>
                    
                    {result.sources.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-3 border-t pt-4 dark:border-gray-700">Sources</h3>
                            <ul className="space-y-2">
                                {result.sources.map((source, index) => (
                                    source.web.uri && (
                                        <li key={index} className="flex items-start">
                                            <span className="text-primary-dark dark:text-primary-light mr-2">&#8226;</span>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    )
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;