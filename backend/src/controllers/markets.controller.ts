import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

// Schema for creating a market
const createMarketSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    category: z.string(),
    closeDate: z.string(),
    resolutionSource: z.string()
});

// Create a new market
export const createMarket = async (req: Request, res: Response) => {
    try {
        const data = createMarketSchema.parse(req.body);
        const market = await prisma.market.create({
            data: {
                ...data,
                closeDate: new Date(data.closeDate),
            }
        });
        res.status(201).json(market);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data', details: error });
    }
};

// Get all open markets
export const getMarkets = async (req: Request, res: Response) => {
    try {
        const markets = await prisma.market.findMany({
            where: { status: 'OPEN' },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { predictions: true, comments: true } }
            }
        });
        res.json(markets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch markets' });
    }
};

// Get top trending markets
export const getTrendingMarkets = async (req: Request, res: Response) => {
    try {
        const markets = await prisma.market.findMany({
            where: { status: 'OPEN' },
            orderBy: { yesPoints: 'desc' },
            take: 10,
            include: {
                _count: { select: { predictions: true, comments: true } }
            }
        });
        res.json(markets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trending markets' });
    }
};

// Get a single market by ID
export const getMarket = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const market = await prisma.market.findUnique({
            where: { id },
            include: {
                _count: { select: { predictions: true, comments: true } }
            }
        });
        if (!market) return res.status(404).json({ error: 'Market not found' });
        res.json(market);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch market' });
    }
};

// Update a market
export const updateMarket = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const market = await prisma.market.update({
            where: { id },
            data: req.body
        });
        res.json(market);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update market', details: error });
    }
};

// Delete a market
export const deleteMarket = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.market.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete market' });
    }
};

// Resolve a market
export const resolveMarket = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { result } = req.body; // 'YES' or 'NO'

        if (result !== 'YES' && result !== 'NO') {
            return res.status(400).json({ error: 'Result must be YES or NO' });
        }

        // Fetch the market with predictions
        const market = await prisma.market.findUnique({
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

        await prisma.$transaction(async (tx) => {
            // 1. Mark market as resolved
            await tx.market.update({
                where: { id },
                data: { status: 'RESOLVED', result }
            });

            // 2. Distribute points to winners
            if (winningPoints === 0 || totalPool === 0) return;

            for (const prediction of market.predictions) {
                if (prediction.prediction === result) {
                    const payout = Math.floor((prediction.pointsStaked / winningPoints) * totalPool);
                    await tx.user.update({
                        where: { id: prediction.userId },
                        data: {
                            points: { increment: payout },
                            accuracy: { increment: 1 } // simple accuracy increment
                        }
                    });
                }
            }
        });

        res.json({ message: 'Market resolved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resolve market' });
    }
};