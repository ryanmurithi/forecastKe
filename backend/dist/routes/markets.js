"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const markets_controller_1 = require("../controllers/markets.controller");
const auth_1 = require("../middleware/auth");
const adminOnly_1 = require("../middleware/adminOnly");
const router = (0, express_1.Router)();
router.get('/', markets_controller_1.getMarkets);
router.get('/trending', markets_controller_1.getTrendingMarkets);
router.get('/:id', markets_controller_1.getMarket);
// Admin only routes
router.post('/', auth_1.authenticateToken, adminOnly_1.adminOnly, markets_controller_1.createMarket);
router.patch('/:id', auth_1.authenticateToken, adminOnly_1.adminOnly, markets_controller_1.updateMarket);
router.post('/:id/resolve', auth_1.authenticateToken, adminOnly_1.adminOnly, markets_controller_1.resolveMarket);
router.delete('/:id', auth_1.authenticateToken, adminOnly_1.adminOnly, markets_controller_1.deleteMarket);
exports.default = router;
