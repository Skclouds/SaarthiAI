import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: requireEnv('MONGODB_URI'),
  jwtSecret: requireEnv('JWT_SECRET'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  geminiApiKey: requireEnv('GEMINI_API_KEY'),
  pineconeApiKey: requireEnv('PINECONE_API_KEY'),
  pineconeIndex: requireEnv('PINECONE_INDEX'),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadBytes: 10 * 1024 * 1024,
  ragTopK: parseInt(process.env.RAG_TOP_K || '5', 10),
};
