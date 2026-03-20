import { Router } from 'express';
import { createMarket, getMarkets, getTrendingMarkets, getMarket, updateMarket, deleteMarket, resolveMarket } from '../controllers/markets.controller';
import { authenticateToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getMarkets);
router.get('/trending', getTrendingMarkets);
router.get('/:id', getMarket);

// Admin only routes
router.post('/', authenticateToken, adminOnly, createMarket);
router.patch('/:id', authenticateToken, adminOnly, updateMarket);
router.post('/:id/resolve', authenticateToken, adminOnly, resolveMarket);
router.delete('/:id', authenticateToken, adminOnly, deleteMarket);

export default router;
