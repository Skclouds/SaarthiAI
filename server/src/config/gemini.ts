import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const CHAT_MODEL = 'gemini-2.5-flash';
export const EMBEDDING_DIMENSIONS = 1536;

export const genAI = new GoogleGenerativeAI(env.geminiApiKey);

export const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
export const chatModel = genAI.getGenerativeModel({ model: CHAT_MODEL });
