import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const postComment = async (req: AuthRequest, res: Response) => {
    try {
        const { marketId, content, parentId, imageUrl } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const comment = await prisma.comment.create({
            data: {
                marketId,
                content,
                userId,
                parentId: parentId || null,
                imageUrl: imageUrl || null
            },
            include: {
                user: { select: { username: true } }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post comment' });
    }
};

export const getComments = async (req: Request, res: Response) => {
    try {
        const marketId = req.params.marketId as string;
        const comments = await prisma.comment.findMany({
            where: { marketId, parentId: null },
            include: {
                user: { select: { username: true } },
                reactions: true,
                replies: {
                    include: {
                        user: { select: { username: true } },
                        reactions: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;
        const role = req.user?.role;

        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        if (comment.userId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.comment.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

export const toggleReaction = async (req: AuthRequest, res: Response) => {
    try {
        const { commentId, reactionType } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const existingReaction = await prisma.reaction.findFirst({
            where: { commentId, userId, reactionType }
        });

        if (existingReaction) {
            await prisma.reaction.delete({ where: { id: existingReaction.id } });
            return res.json({ message: 'Reaction removed' });
        }

        const reaction = await prisma.reaction.create({
            data: { commentId, userId, reactionType }
        });
        res.status(201).json(reaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle reaction' });
    }
};
