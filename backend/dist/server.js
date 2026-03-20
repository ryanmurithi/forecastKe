"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT || 4000;
const server = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true
    }
});
exports.io.on('connection', (socket) => {
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
