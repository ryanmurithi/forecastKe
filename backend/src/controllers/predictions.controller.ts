import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { io } from '../server';
import { AuthRequest } from '../middleware/auth';

export const placePrediction = async (req: AuthRequest, res: Response) => {
    try {
        const { marketId, prediction, pointsStaked } = req.body; // prediction: 'YES' | 'NO'
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        if (pointsStaked < 10) {
            return res.status(400).json({ error: 'Minimum stake is 10 points' });
        }

        const market = await prisma.market.findUnique({
            where: { id: marketId }
        });

        if (!market || market.status !== 'OPEN') {
            return res.status(400).json({ error: 'Market not open or not found' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.points < pointsStaked) {
            return res.status(400).json({ error: 'Insufficient points' });
        }

        const existingPrediction = await prisma.prediction.findFirst({
            where: { userId, marketId }
        });

        if (existingPrediction) {
            return res.status(400).json({ error: 'Already predicted on this market' });
        }

        const newPrediction = await prisma.$transaction(async (tx) => {
            // Deduct points
            await tx.user.update({
                where: { id: userId },
                data: { points: { decrement: pointsStaked } }
            });

            // Add to market points
            const updatedMarket = await tx.market.update({
                where: { id: marketId },
                data: {
                    yesPoints: prediction === 'YES' ? { increment: pointsStaked } : undefined,
                    noPoints: prediction === 'NO' ? { increment: pointsStaked } : undefined,
                }
            });

            // Create prediction record
            const p = await tx.prediction.create({
                data: {
                    userId,
                    marketId,
                    prediction,
                    pointsStaked
                }
            });

            // Emit new probabilities via socket
            io.to(`market:${marketId}`).emit('probability_update', {
                yesPoints: updatedMarket.yesPoints,
                noPoints: updatedMarket.noPoints
            });

            return p;
        });

        res.status(201).json(newPrediction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to place prediction' });
    }
};

export const getMyPredictions = async (req: AuthRequest, res: Response) => {
    try {
        const predictions = await prisma.prediction.findMany({
            where: { userId: req.user?.userId },
            include: { market: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
};

export const getMarketPredictions = async (req: Request, res: Response) => {
    try {
        const marketId = req.params.marketId as string;
        const predictions = await prisma.prediction.findMany({
            where: { marketId },
            include: { user: { select: { username: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
};
