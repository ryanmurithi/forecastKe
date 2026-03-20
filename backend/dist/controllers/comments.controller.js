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
exports.toggleReaction = exports.deleteComment = exports.getComments = exports.postComment = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const postComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { marketId, content, parentId, imageUrl } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const comment = yield prisma_1.default.comment.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to post comment' });
    }
});
exports.postComment = postComment;
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { marketId } = req.params;
        const comments = yield prisma_1.default.comment.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});
exports.getComments = getComments;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        const comment = yield prisma_1.default.comment.findUnique({ where: { id } });
        if (!comment)
            return res.status(404).json({ error: 'Comment not found' });
        if (comment.userId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        yield prisma_1.default.comment.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});
exports.deleteComment = deleteComment;
const toggleReaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { commentId, reactionType } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const existingReaction = yield prisma_1.default.reaction.findFirst({
            where: { commentId, userId, reactionType }
        });
        if (existingReaction) {
            yield prisma_1.default.reaction.delete({ where: { id: existingReaction.id } });
            return res.json({ message: 'Reaction removed' });
        }
        const reaction = yield prisma_1.default.reaction.create({
            data: { commentId, userId, reactionType }
        });
        res.status(201).json(reaction);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to toggle reaction' });
    }
});
exports.toggleReaction = toggleReaction;
