import { Router } from 'express';
import { postComment, getComments, deleteComment, toggleReaction } from '../controllers/comments.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/:marketId', getComments);
router.post('/', authenticateToken, postComment);
router.delete('/:id', authenticateToken, deleteComment);
router.post('/react', authenticateToken, toggleReaction);

export default router;
