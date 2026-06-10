import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import {
  adminCors,
  adminPreflightCors,
  publicChatCors,
  publicChatPreflightCors,
} from './middleware/cors';
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

app.use(express.json());

/** Preflight — handled before route mounts so OPTIONS never 404s. */
app.options('/chat', publicChatPreflightCors);
app.options('/chat/*', publicChatPreflightCors);
app.options('/auth', adminPreflightCors);
app.options('/auth/*', adminPreflightCors);
app.options('/documents', adminPreflightCors);
app.options('/documents/*', adminPreflightCors);
app.options('/bot-config', adminPreflightCors);
app.options('/bot-config/*', adminPreflightCors);
app.options('/tickets', adminPreflightCors);
app.options('/tickets/*', adminPreflightCors);
app.options('/escalations', adminPreflightCors);
app.options('/escalations/*', adminPreflightCors);
app.options('/conversations', adminPreflightCors);
app.options('/conversations/*', adminPreflightCors);
app.options('/stats', adminPreflightCors);
app.options('/stats/*', adminPreflightCors);
app.options('/analytics', adminPreflightCors);
app.options('/analytics/*', adminPreflightCors);
app.options('/notifications', adminPreflightCors);
app.options('/notifications/*', adminPreflightCors);

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
