"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
const router = (0, express_1.Router)();
router.get('/', leaderboard_controller_1.getLeaderboardByPoints);
router.get('/accuracy', leaderboard_controller_1.getLeaderboardByAccuracy);
exports.default = router;
