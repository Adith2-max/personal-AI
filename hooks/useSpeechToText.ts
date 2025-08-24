import { useState, useRef, useEffect, useCallback } from 'react';

// --- Start of Type Definitions for Web Speech API ---
// These types are not included in standard TypeScript DOM library and are added here to support the Web Speech API.

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    grammars: any; // Using 'any' for SpeechGrammarList for simplicity
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    abort(): void;
    start(): void;
    stop(): void;
}

// This represents the constructor for the SpeechRecognition object.
interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

// --- End of Type Definitions ---

// The SpeechRecognition API is vendor-prefixed in some browsers.
// We cast `window` to `any` to access these non-standard properties and rename the constant to avoid name collision.
const SpeechRecognitionAPI: SpeechRecognitionStatic | undefined =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechToText = (onTranscriptionEnd: (text: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, []);

    const startListening = useCallback(async () => {
        if (isListening || !recognitionRef.current) return;
        
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setTranscript('');
            setError(null);
            setIsListening(true);
            recognitionRef.current.start();
        } catch (err) {
            setError('Microphone access denied. Please allow microphone access in your browser settings.');
            console.error('Microphone access error:', err);
            setIsListening(false);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (!isListening || !recognitionRef.current) return;
        recognitionRef.current.stop();
        onTranscriptionEnd(transcript);
    }, [isListening, onTranscriptionEnd, transcript]);

    return { isListening, transcript, error, startListening, stopListening, hasSupport: !!SpeechRecognitionAPI };
};