import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import documentsRoutes from './routes/documents.routes';
import botConfigRoutes from './routes/bot-config.routes';
import chatRoutes from './routes/chat.routes';
import ticketsRoutes from './routes/tickets.routes';
import escalationsRoutes from './routes/escalations.routes';
import conversationsRoutes from './routes/conversations.routes';
import statsRoutes from './routes/stats.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationsRoutes from './routes/notifications.routes';

const app = express();

const adminCors = cors({
  origin: env.clientUrl,
  credentials: false,
});

/** Public chat widget may be embedded on any third-party origin. */
const publicChatCors = cors({
  origin: true,
  credentials: false,
});

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SaarthiAI' });
});

app.use('/chat', publicChatCors, chatRoutes);
app.use('/auth', adminCors, authRoutes);
app.use('/documents', adminCors, documentsRoutes);
app.use('/bot-config', adminCors, botConfigRoutes);
app.use('/tickets', adminCors, ticketsRoutes);
app.use('/escalations', adminCors, escalationsRoutes);
app.use('/conversations', adminCors, conversationsRoutes);
app.use('/stats', adminCors, statsRoutes);
app.use('/analytics', adminCors, analyticsRoutes);
app.use('/notifications', adminCors, notificationsRoutes);

app.use(errorHandler);

export default app;
