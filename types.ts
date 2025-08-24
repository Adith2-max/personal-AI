export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Model {
    FLASH = 'gemini-2.5-flash',
    PRO = 'gemini-2.5-pro',
}

export interface GroundingChunk {
    web: {
        uri?: string;
        title?: string;
    }
}
export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'model';
    image?: string; // base64 string
    isStreaming?: boolean;
    sources?: GroundingChunk[];
}