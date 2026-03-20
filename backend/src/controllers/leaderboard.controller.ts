import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getLeaderboardByPoints = async (req: Request, res: Response) => {
    try {
        const topUsers = await prisma.user.findMany({
            orderBy: { points: 'desc' },
            take: 50,
            select: {
                id: true,
                username: true,
                points: true,
                accuracy: true,
                streak: true
            }
        });
        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

export const getLeaderboardByAccuracy = async (req: Request, res: Response) => {
    try {
        const topUsers = await prisma.user.findMany({
            orderBy: { accuracy: 'desc' },
            take: 50,
            select: {
                id: true,
                username: true,
                points: true,
                accuracy: true,
                streak: true
            }
        }); // Needs minimum predictions filter eventually
        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
