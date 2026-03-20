"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const markets_1 = __importDefault(require("./routes/markets"));
const predictions_1 = __importDefault(require("./routes/predictions"));
const comments_1 = __importDefault(require("./routes/comments"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/markets', markets_1.default);
app.use('/api/predictions', predictions_1.default);
app.use('/api/comments', comments_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
exports.default = app;
