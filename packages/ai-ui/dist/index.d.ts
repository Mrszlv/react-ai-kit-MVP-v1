import * as React from 'react';
import React__default, { PropsWithChildren } from 'react';

type Role = "system" | "user" | "assistant";
type AIMessage = {
    role: Role;
    content: string;
};
type StreamHandlers = {
    onToken?: (t: string) => void;
    onDone?: (final: string) => void;
};
interface AIClient {
    name: string;
    generate(opts: {
        model: string;
        prompt: string;
        temperature?: number;
    }): Promise<string>;
    chat(opts: {
        model: string;
        messages: AIMessage[];
        temperature?: number;
    }): Promise<string>;
    streamGenerate(prompt: string, handlers: StreamHandlers, opts?: {
        model: string;
        temperature?: number;
    }): Promise<void>;
}

type ProviderName = "openai" | "groq";
type AIContextType = {
    client: AIClient;
    fallback?: AIClient;
    defaultModel: string;
    provider: ProviderName;
    setProvider: (p: ProviderName) => void;
};
declare const AIContext: React__default.Context<AIContextType | null>;
declare const AIProviderBase: React__default.FC<React__default.PropsWithChildren<{
    value: AIContextType;
}>>;
declare function useAIContext(): AIContextType;

declare function useAI(defaultModel?: string): {
    chat: (messages: AIMessage[], temperature?: number) => Promise<string>;
    generate: (prompt: string, temperature?: number) => Promise<string>;
    streamGenerate: (prompt: string, handlers: {
        onToken?: (t: string) => void;
        onDone?: (final: string) => void;
    }, temperature?: number) => Promise<void>;
    loading: boolean;
    error: string | null;
    provider: ProviderName;
};

declare class OpenAIClient implements AIClient {
    name: "openai";
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    private headers;
    generate(opts: {
        model: string;
        prompt: string;
        temperature?: number;
    }): Promise<any>;
    chat(opts: {
        model: string;
        messages: AIMessage[];
        temperature?: number;
    }): Promise<any>;
    streamGenerate(prompt: string, handlers: {
        onToken?: (t: string) => void;
        onDone?: (final: string) => void;
    }, opts?: {
        model: string;
        temperature?: number;
    }): Promise<void>;
}

declare class GroqClient implements AIClient {
    name: "groq";
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    private headers;
    private mapModel;
    generate(opts: {
        model: string;
        prompt: string;
        temperature?: number;
    }): Promise<any>;
    chat(opts: {
        model: string;
        messages: AIMessage[];
        temperature?: number;
    }): Promise<any>;
    streamGenerate(prompt: string, handlers: {
        onToken?: (t: string) => void;
        onDone?: (final: string) => void;
    }, opts?: {
        model: string;
        temperature?: number;
    }): Promise<void>;
}

declare function readOpenAISSE(res: Response, onDelta: (chunk: string) => void): Promise<string>;

type Props = React__default.PropsWithChildren<{
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit";
}>;
declare const Button: React__default.FC<Props>;

type CardProps = {
    children: React__default.ReactNode;
    className?: string;
};
declare const Card: React__default.FC<CardProps>;

declare const ChatBox: React__default.FC;

declare const Summarizer: React__default.FC;

declare const Translator: React__default.FC;

declare const Rewriter: React__default.FC;

declare const AIProvider: React__default.FC<PropsWithChildren>;

declare const AIUI: {
    ChatBox: React.FC<{}>;
    Summarizer: React.FC<{}>;
    Translator: React.FC<{}>;
    Rewriter: React.FC<{}>;
    AIProvider: React.FC<{
        children?: React.ReactNode | undefined;
    }>;
    useAI: typeof useAI;
};

export { type AIClient, AIContext, type AIContextType, type AIMessage, AIProvider, AIProviderBase, Button, Card, ChatBox, GroqClient, OpenAIClient, type ProviderName, Rewriter, type Role, type StreamHandlers, Summarizer, Translator, AIUI as default, readOpenAISSE, useAI, useAIContext };
