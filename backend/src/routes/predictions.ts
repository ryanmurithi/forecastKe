import { Router } from 'express';
import { placePrediction, getMyPredictions, getMarketPredictions } from '../controllers/predictions.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, placePrediction);
router.get('/me', authenticateToken, getMyPredictions);
router.get('/:marketId', getMarketPredictions);

export default router;
