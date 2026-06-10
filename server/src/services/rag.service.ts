import { Types } from 'mongoose';
import { THRESHOLD } from '../constants/rag';
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from '../config/gemini';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { Business, ChatSourceLog, Conversation, DocumentModel, Message } from '../models';
import * as botConfigService from './bot-config.service';
import * as chatService from './chat.service';
import * as escalationService from './escalation.service';
import * as notificationService from './notification.service';
import { embedQuery } from './embedding.service';
import * as pineconeService from './pinecone.service';

export interface ChatRequest {
  businessId: string;
  conversationId?: string;
  customerName: string;
  customerEmail: string;
  message: string;
}

export interface SourceDocument {
  documentId: string;
  filename: string;
}

export interface ChatResponse {
  conversationId: string;
  message: {
    id: string;
    role: 'ASSISTANT';
    content: string;
    responseTimeMs: number;
    unanswered: boolean;
  };
  sources: SourceDocument[];
}

async function resolveSources(documentIds: string[]): Promise<SourceDocument[]> {
  const uniqueIds = [...new Set(documentIds)];
  const docs = await DocumentModel.find({
    _id: { $in: uniqueIds.map((id) => new Types.ObjectId(id)) },
  }).lean();

  return docs.map((doc) => ({
    documentId: doc._id.toString(),
    filename: doc.filename,
  }));
}

export async function handleChat(input: ChatRequest): Promise<ChatResponse> {
  const business = await Business.findById(input.businessId);
  if (!business) {
    throw new AppError('Business not found', 404);
  }

  const businessId = new Types.ObjectId(input.businessId);
  const botConfig = await botConfigService.getOrCreateBotConfig(businessId);

  let conversation;
  let isNewConversation = false;
  if (input.conversationId) {
    conversation = await Conversation.findOne({
      _id: new Types.ObjectId(input.conversationId),
      businessId,
    });
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }
  } else {
    conversation = await Conversation.create({
      businessId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
    });
    isNewConversation = true;
  }

  await Message.create({
    conversationId: conversation._id,
    role: 'USER',
    content: input.message,
  });

  const startTime = Date.now();
  const namespace = input.businessId;

  console.log('[RAG] /chat retrieval:', {
    businessId: namespace,
    embeddingModel: EMBEDDING_MODEL,
    embeddingDimensions: EMBEDDING_DIMENSIONS,
    threshold: THRESHOLD,
  });

  const queryVector = await embedQuery(input.message);
  const matches = await pineconeService.queryVectors(namespace, queryVector, env.ragTopK);

  const sourceDocs = await resolveSources(matches.map((m) => m.metadata.documentId));
  const filenameByDocId = Object.fromEntries(
    sourceDocs.map((s) => [s.documentId, s.filename]),
  );

  console.log('[RAG] Pinecone results:', {
    namespace,
    matchCount: matches.length,
    threshold: THRESHOLD,
    matches: matches.map((m) => ({
      score: m.score,
      documentId: m.metadata.documentId,
      sourceDocument: filenameByDocId[m.metadata.documentId] ?? '(unknown)',
      chunkIndex: m.metadata.chunkIndex,
    })),
  });

  const topScore = matches[0]?.score ?? 0;
  const isRelevant = topScore >= THRESHOLD && matches.length > 0;

  let assistantContent: string;
  let unanswered = false;
  let sources: SourceDocument[] = [];

  if (!isRelevant) {
    unanswered = true;
    const systemPrompt = chatService.buildUnansweredPrompt(
      botConfig.botName,
      botConfig.personality,
    );
    assistantContent = await chatService.generateRAGReply(systemPrompt, input.message);
    await Conversation.findByIdAndUpdate(conversation._id, { escalated: true });
  } else {
    const context = matches
      .map((m, i) => `[${i + 1}] ${m.metadata.text}`)
      .join('\n\n');

    const systemPrompt = chatService.buildSystemPrompt(
      botConfig.botName,
      botConfig.personality,
      context,
    );
    assistantContent = await chatService.generateRAGReply(systemPrompt, input.message);

    sources = sourceDocs;
  }

  const responseTimeMs = Date.now() - startTime;

  const assistantMessage = await Message.create({
    conversationId: conversation._id,
    role: 'ASSISTANT',
    content: assistantContent,
    responseTimeMs,
    unanswered,
  });

  if (sources.length > 0) {
    await ChatSourceLog.insertMany(
      sources.map((s) => ({
        businessId,
        conversationId: conversation._id,
        messageId: assistantMessage._id,
        documentId: new Types.ObjectId(s.documentId),
      })),
    );
  }

  if (isNewConversation) {
    await notificationService.notifyNewConversation(
      businessId,
      conversation._id,
      input.customerName,
    );
  }

  await escalationService.processEscalation(
    businessId,
    conversation._id,
    input.customerName,
    input.customerEmail,
    input.message,
    botConfig.escalationRules,
  );

  return {
    conversationId: conversation._id.toString(),
    message: {
      id: assistantMessage._id.toString(),
      role: 'ASSISTANT',
      content: assistantContent,
      responseTimeMs,
      unanswered,
    },
    sources,
  };
}
