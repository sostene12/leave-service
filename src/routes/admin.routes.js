import express from 'express';
import {
  upsertDepartment,
  getAllDepartments,
  deleteDepartment,
  generateLeaveReport,
  generateBalanceReport
} from '../controllers/admin.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Department management routes
router.post('/departments', verifyToken, isAdmin, upsertDepartment);
router.get('/departments', verifyToken, isAdmin, getAllDepartments);
router.delete('/departments/:id', verifyToken, isAdmin, deleteDepartment);

// Report generation routes
router.get('/reports/leave', verifyToken, isAdmin, generateLeaveReport);
router.get('/reports/balance', verifyToken, isAdmin, generateBalanceReport);

export default router;