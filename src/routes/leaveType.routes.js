import express from 'express';
import {
  createLeaveType,
  getAllLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType
} from '../controllers/leaveType.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route to get all leave types
router.get('/', verifyToken, getAllLeaveTypes);

// Route to get leave type by ID
router.get('/:id', verifyToken, getLeaveTypeById);

// Route to create a new leave type (admin only)
router.post('/', verifyToken, isAdmin, createLeaveType);

// Route to update a leave type (admin only)
router.put('/:id', verifyToken, isAdmin, updateLeaveType);

// Route to delete a leave type (admin only)
router.delete('/:id', verifyToken, isAdmin, deleteLeaveType);

export default router;