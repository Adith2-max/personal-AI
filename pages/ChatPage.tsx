import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Part, Content } from "@google/genai";
import { Message, Model, GroundingChunk } from '../types';
import { streamChat } from '../services/geminiService';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { SendIcon, AttachmentIcon, MicrophoneIcon, CloseIcon } from '../constants';
import ListeningModal from '../components/ListeningModal';
import Spinner from '../components/Spinner';

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [useWebSearch, setUseWebSearch] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const handleTranscriptionEnd = useCallback((text: string) => {
        setInput(text);
    }, []);

    const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechToText(handleTranscriptionEnd);

    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [messages]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const fileToGenerativePart = async (file: File): Promise<Part> => {
        const base64EncodedData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: {
                data: base64EncodedData,
                mimeType: file.type,
            },
        };
    };

    const sendMessage = async () => {
        if (!input.trim() && !imageFile) return;

        if (!navigator.onLine) {
            setError("You are currently offline. Please check your internet connection.");
            return;
        }

        setError(null);
        setIsLoading(true);

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            image: imageBase64 ?? undefined,
        };
        setMessages(prev => [...prev, userMessage]);
        
        const modelMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: modelMessageId, text: '', sender: 'model', isStreaming: true }]);

        setInput('');
        setImageFile(null);
        setImageBase64(null);

        try {
            const history: Content[] = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            
            const imagePart = imageFile ? await fileToGenerativePart(imageFile) : null;
            
            const stream = await streamChat(history, input, imagePart, useWebSearch, Model.FLASH);

            let fullText = "";
            let sources: GroundingChunk[] = [];
            for await (const chunk of stream) {
                fullText += chunk.text;
                if(chunk.candidates && chunk.candidates[0].groundingMetadata?.groundingChunks) {
                    sources = chunk.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
                }
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: fullText, sources } : msg
                ));
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId ? { ...msg, text: `Error: ${errorMessage}`, isStreaming: false } : msg
            ));
        } finally {
            setIsLoading(false);
             setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId ? { ...msg, isStreaming: false } : msg
            ));
        }
    };
    
    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center gap-4 flex-wrap">
                <h1 className="text-xl font-bold">AI Chat</h1>
                <div className="flex items-center space-x-4 flex-wrap justify-end">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium whitespace-nowrap">Chat Model:</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">Gemini 2.5 Flash</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Web Search</span>
                        <label htmlFor="web-search-toggle" className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="web-search-toggle" className="sr-only peer" checked={useWebSearch} onChange={() => setUseWebSearch(!useWebSearch)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-dark"></div>
                        </label>
                    </div>
                </div>
            </header>

            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary-dark text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            {msg.image && <img src={msg.image} alt="user upload" className="rounded-lg mb-2 max-h-64" />}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.isStreaming && <div className="inline-block w-2 h-4 bg-gray-500 animate-pulse ml-1" />}
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 max-w-xl text-xs text-gray-500 dark:text-gray-400">
                                <h4 className="font-bold mb-1">Sources:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {msg.sources.map((source, index) => (
                                        source.web.uri && (
                                            <li key={index}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    {source.web.title || source.web.uri}
                                                </a>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && messages[messages.length-1]?.sender !== 'model' && (
                  <div className="flex justify-center"><Spinner /></div>
                )}
                
            </div>

            <div className="p-4 border-t dark:border-gray-700">
                 {error && <p className="text-red-500 text-center mb-2">{error}</p>}
                 {imageBase64 && (
                    <div className="relative inline-block mb-2">
                        <img src={imageBase64} alt="preview" className="h-20 w-20 object-cover rounded-md"/>
                        <button onClick={() => { setImageFile(null); setImageBase64(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                           <CloseIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden"/>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-300 hover:text-primary-dark dark:hover:text-primary-light">
                        <AttachmentIcon className="h-6 w-6" />
                    </button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Type a message or upload an image..."
                        rows={1}
                        className="flex-1 bg-transparent focus:outline-none resize-none mx-2"
                        disabled={isLoading}
                    />
                     {hasSupport && (
                        <button onClick={isListening ? stopListening : startListening} className={`p-2 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-300 hover:text-primary-dark dark:hover:text-primary-light'}`}>
                            <MicrophoneIcon className="h-6 w-6" />
                        </button>
                    )}
                    <button onClick={sendMessage} disabled={isLoading || (!input.trim() && !imageFile)} className="p-2 text-white bg-primary-dark rounded-full disabled:bg-gray-400 dark:disabled:bg-gray-600">
                        <SendIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <ListeningModal isOpen={isListening} transcript={transcript} onClose={stopListening} />
        </div>
    );
};

export default ChatPage;