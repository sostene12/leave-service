import express from 'express';
import {
  getUserLeaveBalance,
  adjustLeaveBalance,
  processAccrualsManually,
  processYearEndCarryOverManually,
  processExpiringCarryOversManually
} from '../controllers/leaveBalance.controller.js';
import { verifyToken, isStaff, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route to get user's leave balance
router.get('/:userId?', verifyToken, isStaff, getUserLeaveBalance);

// Route to adjust leave balance (admin only)
router.put('/adjust', verifyToken, isAdmin, adjustLeaveBalance);

// Route to process accruals manually (admin only)
router.post('/process-accruals', verifyToken, isAdmin, processAccrualsManually);

// Route to process year-end carry over manually (admin only)
router.post('/process-year-end', verifyToken, isAdmin, processYearEndCarryOverManually);

// Route to process expiring carry over balances manually (admin only)
router.post('/process-expiring', verifyToken, isAdmin, processExpiringCarryOversManually);

export default router;