import express from 'express';
import {
  submitLeaveRequest,
  approveLeaveRequestController,
  rejectLeaveRequestController,
  cancelLeaveRequestController,
  getUserLeaveRequestsController,
  getDepartmentLeaveRequestsController,
  getPendingLeaveRequestsController,
  getActiveLeaveRequestsController
} from '../controllers/leaveRequest.controller.js';
import { verifyToken, isStaff, isManager, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route to submit a new leave request
router.post('/', verifyToken, isStaff, submitLeaveRequest);

// Route to get user's leave requests
router.get('/my-requests', verifyToken, isStaff, getUserLeaveRequestsController);

// Route to get department leave requests (for managers)
router.get('/department/:departmentId?', verifyToken, isManager, getDepartmentLeaveRequestsController);

// Route to get pending leave requests (for managers)
router.get('/pending/:departmentId?', verifyToken, isManager, getPendingLeaveRequestsController);

// Route to get active leave requests (for team calendar)
router.get('/active', verifyToken, isStaff, getActiveLeaveRequestsController);

// Route to approve a leave request (manager only)
router.put('/approve/:id', verifyToken, isManager, approveLeaveRequestController);

// Route to reject a leave request (manager only)
router.put('/reject/:id', verifyToken, isManager, rejectLeaveRequestController);

// Route to cancel a leave request
router.put('/cancel/:id', verifyToken, isStaff, cancelLeaveRequestController);

export default router;