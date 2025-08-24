
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { ImageIcon } from '../constants';

const ImagePage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }

        if (!navigator.onLine) {
            setError("You are currently offline. Please check your internet connection to generate images.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageUrl = await generateImage(prompt);
            setGeneratedImage(imageUrl);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image generation.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Image Generation Studio</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Bring your ideas to life. Describe anything you can imagine.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A cinematic shot of a robot meditating on a mountaintop during a thunderstorm"
                        className="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-dark focus:border-primary-dark transition"
                        rows={4}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-dark hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
                    >
                        {isLoading ? <Spinner size="sm"/> : <><ImageIcon className="h-5 w-5 mr-2" /> Generate</>}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>

            <div className="mt-8">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-10 bg-gray-100 dark:bg-gray-800 rounded-xl aspect-square">
                        <Spinner size="lg" />
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Generating your masterpiece...</p>
                    </div>
                )}
                {generatedImage && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                        <img src={generatedImage} alt={prompt} className="w-full h-auto rounded-lg object-contain" />
                    </div>
                )}
                 {!isLoading && !generatedImage && (
                    <div className="flex flex-col items-center justify-center p-10 bg-gray-100 dark:bg-gray-800 rounded-xl aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <ImageIcon className="h-24 w-24 text-gray-400 dark:text-gray-500" />
                        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Your generated image will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImagePage;