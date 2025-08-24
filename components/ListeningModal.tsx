
import React from 'react';
import { MicrophoneIcon } from '../constants';

interface ListeningModalProps {
    isOpen: boolean;
    transcript: string;
    onClose: () => void;
}

const ListeningModal: React.FC<ListeningModalProps> = ({ isOpen, transcript, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-2xl w-full">
                <div className="animate-pulse flex items-center justify-center text-primary-dark dark:text-primary-light mb-4">
                    <MicrophoneIcon className="h-10 w-10 mr-3" />
                    <span className="text-2xl font-bold">Listening...</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg min-h-[5rem]">
                    {transcript || 'Speak now...'}
                </p>
                <button
                    onClick={onClose}
                    className="mt-6 bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                >
                    Stop
                </button>
            </div>
        </div>
    );
};

export default ListeningModal;
