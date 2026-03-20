import { Server } from 'socket.io';
import app from './app';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_market', (marketId) => {
        socket.join(`market:${marketId}`);
        console.log(`Socket ${socket.id} joined market:${marketId}`);
    });

    socket.on('leave_market', (marketId) => {
        socket.leave(`market:${marketId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
