const express = require('express');
const router = express.Router();
const { getDashboardStats, getAdmins, getAdminDashboardStats, resetSystem } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('Principal', 'Admin'), getDashboardStats);
router.get('/admins', protect, authorize('Principal', 'Admin'), getAdmins);
router.get('/admin/stats', protect, authorize('Admin'), getAdminDashboardStats);
router.delete('/admin/reset', protect, authorize('Admin'), resetSystem);

module.exports = router;
