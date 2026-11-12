export type Provider = 'openai' | 'gemini' | 'anthropic' | 'perplexity';
export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error' | 'offline';
export interface UserProfile { sub: string; name: string; email: string; picture?: string }
export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; createdAt: number }
export interface EncryptedSecret { salt: string; iv: string; ciphertext: string; version: 1 }
export interface ProviderSettings { provider: Provider; model: string; secret?: EncryptedSecret }
export interface LocalTask { id: string; text: string; done: boolean; createdAt: number }
export interface LocalNote { id: string; text: string; createdAt: number }
export interface WeatherSummary { temperature: number; apparent: number; code: number; wind: number; precipitation: number; description: string }