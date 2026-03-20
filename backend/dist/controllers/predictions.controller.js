"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketPredictions = exports.getMyPredictions = exports.placePrediction = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const server_1 = require("../server");
const placePrediction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { marketId, prediction, pointsStaked } = req.body; // prediction: 'YES' | 'NO'
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (pointsStaked < 10) {
            return res.status(400).json({ error: 'Minimum stake is 10 points' });
        }
        const market = yield prisma_1.default.market.findUnique({
            where: { id: marketId }
        });
        if (!market || market.status !== 'OPEN') {
            return res.status(400).json({ error: 'Market not open or not found' });
        }
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user || user.points < pointsStaked) {
            return res.status(400).json({ error: 'Insufficient points' });
        }
        const existingPrediction = yield prisma_1.default.prediction.findFirst({
            where: { userId, marketId }
        });
        if (existingPrediction) {
            return res.status(400).json({ error: 'Already predicted on this market' });
        }
        const newPrediction = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Deduct points
            yield tx.user.update({
                where: { id: userId },
                data: { points: { decrement: pointsStaked } }
            });
            // Add to market points
            const updatedMarket = yield tx.market.update({
                where: { id: marketId },
                data: {
                    yesPoints: prediction === 'YES' ? { increment: pointsStaked } : undefined,
                    noPoints: prediction === 'NO' ? { increment: pointsStaked } : undefined,
                }
            });
            // Create prediction record
            const p = yield tx.prediction.create({
                data: {
                    userId,
                    marketId,
                    prediction,
                    pointsStaked
                }
            });
            // Emit new probabilities via socket
            server_1.io.to(`market:${marketId}`).emit('probability_update', {
                yesPoints: updatedMarket.yesPoints,
                noPoints: updatedMarket.noPoints
            });
            return p;
        }));
        res.status(201).json(newPrediction);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to place prediction' });
    }
});
exports.placePrediction = placePrediction;
const getMyPredictions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const predictions = yield prisma_1.default.prediction.findMany({
            where: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId },
            include: { market: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(predictions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});
exports.getMyPredictions = getMyPredictions;
const getMarketPredictions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { marketId } = req.params;
        const predictions = yield prisma_1.default.prediction.findMany({
            where: { marketId },
            include: { user: { select: { username: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(predictions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});
exports.getMarketPredictions = getMarketPredictions;
