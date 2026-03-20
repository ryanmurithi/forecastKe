import { Router } from 'express';
import { getLeaderboardByPoints, getLeaderboardByAccuracy } from '../controllers/leaderboard.controller';

const router = Router();

router.get('/', getLeaderboardByPoints);
router.get('/accuracy', getLeaderboardByAccuracy);

export default router;
