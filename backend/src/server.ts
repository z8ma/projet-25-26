import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import creatorRoutes from './routes/creator.routes.js';
import professionalRoutes from './routes/professional.routes.js';
import aiRoutes from './routes/ai.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import calendarRoutes from './routes/calendar.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Raw body for Stripe webhooks (must be before express.json())
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Creative Match API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/calendar', calendarRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

export default app;
