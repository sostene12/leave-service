import LeaveRequest from '../models/leaveRequest.model.js';
import LeaveType from '../models/leaveType.model.js';
import LeaveBalance from '../models/leaveBalance.model.js';
import { 
  createLeaveRequest, 
  approveLeaveRequest, 
  rejectLeaveRequest, 
  cancelLeaveRequest,
  getUserLeaveRequests,
  getDepartmentLeaveRequests,
  getPendingLeaveRequests,
  getActiveLeaveRequests
} from '../services/leaveService.js';
import { getOrCreateBalance } from '../services/balanceService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// Submit a new leave request
export const submitLeaveRequest = async (req, res) => {
  try {
    const { leaveTypeId, startDate, endDate, reason, documentUrl } = req.body;
    const userId = req.user.userId;
    const userName = req.user.name;
    const userEmail = req.user.email;
    const departmentId = req.user.departmentId;
    const userProfilePicture = req.user.profilePicture;
    
    // Check if leave type exists
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return errorResponse(res, 'Invalid leave type', 400);
    }
    
    // Check if user has enough leave balance
    const balance = await getOrCreateBalance(userId, userName, userEmail, departmentId);
    const availableBalance = balance.totalBalance - balance.usedBalance;
    
    // Create request data
    const requestData = {
      userId,
      leaveTypeId,
      startDate,
      endDate,
      reason,
      documentUrl,
      userName,
      userEmail,
      userProfilePicture,
      departmentId
    };
    
    // Create leave request
    const leaveRequest = await createLeaveRequest(requestData);
    
    return successResponse(res, leaveRequest, 'Leave request submitted successfully', 201);
  } catch (error) {
    console.error('Submit leave request error:', error);
    return errorResponse(res, error.message || 'Failed to submit leave request', 500, error);
  }
};

// Approve leave request
export const approveLeaveRequestController = async (req, res) => {
  try {
    const { id } = req.params;
    const approverId = req.user.userId;
    const approverName = req.user.name;
    
    const result = await approveLeaveRequest(id, approverId, approverName);
    
    return successResponse(res, result, 'Leave request approved successfully');
  } catch (error) {
    console.error('Approve leave request error:', error);
    return errorResponse(res, error.message || 'Failed to approve leave request', 500, error);
  }
};

// Reject leave request
export const rejectLeaveRequestController = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const approverId = req.user.userId;
    const approverName = req.user.name;
    
    if (!rejectionReason) {
      return errorResponse(res, 'Rejection reason is required', 400);
    }
    
    const result = await rejectLeaveRequest(id, approverId, approverName, rejectionReason);
    
    return successResponse(res, result, 'Leave request rejected successfully');
  } catch (error) {
    console.error('Reject leave request error:', error);
    return errorResponse(res, error.message || 'Failed to reject leave request', 500, error);
  }
};

// Cancel leave request
export const cancelLeaveRequestController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await cancelLeaveRequest(id, userId);
    
    return successResponse(res, result, 'Leave request canceled successfully');
  } catch (error) {
    console.error('Cancel leave request error:', error);
    return errorResponse(res, error.message || 'Failed to cancel leave request', 500, error);
  }
};

// Get user's leave requests
export const getUserLeaveRequestsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const requests = await getUserLeaveRequests(userId);
    
    return successResponse(res, requests, 'Leave requests retrieved successfully');
  } catch (error) {
    console.error('Get user leave requests error:', error);
    return errorResponse(res, 'Failed to retrieve leave requests', 500, error);
  }
};

// Get department leave requests (for managers)
export const getDepartmentLeaveRequestsController = async (req, res) => {
  try {
    const departmentId = req.params.departmentId || req.user.departmentId;
    
    const requests = await getDepartmentLeaveRequests(departmentId);
    
    return successResponse(res, requests, 'Department leave requests retrieved successfully');
  } catch (error) {
    console.error('Get department leave requests error:', error);
    return errorResponse(res, 'Failed to retrieve department leave requests', 500, error);
  }
};

// Get pending leave requests (for managers)
export const getPendingLeaveRequestsController = async (req, res) => {
  try {
    const departmentId = req.params.departmentId || req.user.departmentId;
    
    const requests = await getPendingLeaveRequests(departmentId);
    
    return successResponse(res, requests, 'Pending leave requests retrieved successfully');
  } catch (error) {
    console.error('Get pending leave requests error:', error);
    return errorResponse(res, 'Failed to retrieve pending leave requests', 500, error);
  }
};

// Get active leave requests (for team calendar)
export const getActiveLeaveRequestsController = async (req, res) => {
  try {
    const requests = await getActiveLeaveRequests();
    
    return successResponse(res, requests, 'Active leave requests retrieved successfully');
  } catch (error) {
    console.error('Get active leave requests error:', error);
    return errorResponse(res, 'Failed to retrieve active leave requests', 500, error);
  }
};