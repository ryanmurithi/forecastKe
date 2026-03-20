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
exports.resolveMarket = exports.deleteMarket = exports.updateMarket = exports.getMarket = exports.getTrendingMarkets = exports.getMarkets = exports.createMarket = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const zod_1 = require("zod");
// Schema for creating a market
const createMarketSchema = zod_1.z.object({
    title: zod_1.z.string().min(5),
    description: zod_1.z.string().min(10),
    category: zod_1.z.string(),
    closeDate: zod_1.z.string(),
    resolutionSource: zod_1.z.string()
});
// Create a new market
const createMarket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = createMarketSchema.parse(req.body);
        const market = yield prisma_1.default.market.create({
            data: Object.assign(Object.assign({}, data), { closeDate: new Date(data.closeDate) })
        });
        res.status(201).json(market);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid data', details: error });
    }
});
exports.createMarket = createMarket;
// Get all open markets
const getMarkets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const markets = yield prisma_1.default.market.findMany({
            where: { status: 'OPEN' },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { predictions: true, comments: true } }
            }
        });
        res.json(markets);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch markets' });
    }
});
exports.getMarkets = getMarkets;
// Get top trending markets
const getTrendingMarkets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const markets = yield prisma_1.default.market.findMany({
            where: { status: 'OPEN' },
            orderBy: { yesPoints: 'desc' },
            take: 10,
            include: {
                _count: { select: { predictions: true, comments: true } }
            }
        });
        res.json(markets);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch trending markets' });
    }
});
exports.getTrendingMarkets = getTrendingMarkets;
// Get a single market by ID
const getMarket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const market = yield prisma_1.default.market.findUnique({
            where: { id },
            include: {
                _count: { select: { predictions: true, comments: true } }
            }
        });
        if (!market)
            return res.status(404).json({ error: 'Market not found' });
        res.json(market);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch market' });
    }
});
exports.getMarket = getMarket;
// Update a market
const updateMarket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const market = yield prisma_1.default.market.update({
            where: { id },
            data: req.body
        });
        res.json(market);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update market', details: error });
    }
});
exports.updateMarket = updateMarket;
// Delete a market
const deleteMarket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield prisma_1.default.market.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete market' });
    }
});
exports.deleteMarket = deleteMarket;
// Resolve a market
const resolveMarket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { result } = req.body; // 'YES' or 'NO'
        if (result !== 'YES' && result !== 'NO') {
            return res.status(400).json({ error: 'Result must be YES or NO' });
        }
        // Fetch the market with predictions
        const market = yield prisma_1.default.market.findUnique({
            where: { id },
            include: { predictions: true }
        });
        if (!market) {
            return res.status(404).json({ error: 'Market not found' });
        }
        if (market.status === 'RESOLVED') {
            return res.status(400).json({ error: 'Market already resolved' });
        }
        const totalPool = market.yesPoints + market.noPoints;
        const winningPoints = result === 'YES' ? market.yesPoints : market.noPoints;
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Mark market as resolved
            yield tx.market.update({
                where: { id },
                data: { status: 'RESOLVED', result }
            });
            // 2. Distribute points to winners
            if (winningPoints === 0 || totalPool === 0)
                return;
            for (const prediction of market.predictions) {
                if (prediction.prediction === result) {
                    const payout = Math.floor((prediction.pointsStaked / winningPoints) * totalPool);
                    yield tx.user.update({
                        where: { id: prediction.userId },
                        data: {
                            points: { increment: payout },
                            accuracy: { increment: 1 } // simple accuracy increment
                        }
                    });
                }
            }
        }));
        res.json({ message: 'Market resolved successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to resolve market' });
    }
});
exports.resolveMarket = resolveMarket;
