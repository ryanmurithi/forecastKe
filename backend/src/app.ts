import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import marketsRoutes from './routes/markets';
import predictionsRoutes from './routes/predictions';
import commentsRoutes from './routes/comments';
import leaderboardRoutes from './routes/leaderboard';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ForecastKE API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/markets', marketsRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

export default app;