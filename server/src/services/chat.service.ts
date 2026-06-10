import { genAI, CHAT_MODEL } from '../config/gemini';
import { BotPersonality } from '../models';
import { withRetry } from '../utils/retry';

const PERSONALITY_GUIDANCE: Record<BotPersonality, string> = {
  Professional: 'Use a formal, concise, and business-appropriate tone.',
  Friendly: 'Use a warm, approachable, and conversational tone.',
  Technical: 'Use a precise, detailed, and technically accurate tone.',
};

export function buildSystemPrompt(
  botName: string,
  personality: BotPersonality,
  context: string,
): string {
  return `You are ${botName}, a customer support AI assistant.
${PERSONALITY_GUIDANCE[personality]}

Answer ONLY using the provided context below. Do not use outside knowledge.
If the context does not contain enough information to answer, say you cannot find that information and offer to connect the customer with a human agent.

Format all replies in Markdown: use headings, bullet lists, GFM tables, and links where helpful.

--- CONTEXT ---
${context}
--- END CONTEXT ---`;
}

export function buildUnansweredPrompt(botName: string, personality: BotPersonality): string {
  return `You are ${botName}, a customer support AI assistant.
${PERSONALITY_GUIDANCE[personality]}

The customer's question could not be answered from the knowledge base.
Politely explain that you don't have enough information to answer their question.
Offer to connect them with a human support agent who can help further.
Format your reply in Markdown.`;
}

export async function generateRAGReply(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    systemInstruction: systemPrompt,
  });

  const result = await withRetry(() => model.generateContent(userMessage));
  const text = result.response.text();

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return text;
}
