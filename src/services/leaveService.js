import LeaveRequest from '../models/leaveRequest.model.js';
import LeaveType from '../models/leaveType.model.js';
import Department from '../models/department.model.js';
import Holiday from '../models/holiday.model.js';
import { calculateWorkingDays, datesOverlap } from '../utils/dateUtils.js';
import emailService from './emailService.js';
import { updateBalanceForApprovedLeave } from './balanceService.js';

// Create a new leave request
export const createLeaveRequest = async (requestData) => {
  try {
    // Get leave type
    const leaveType = await LeaveType.findById(requestData.leaveTypeId);
    if (!leaveType) {
      throw new Error('Invalid leave type');
    }
    
    // Get holidays for working day calculation
    const holidays = await Holiday.find({});
    
    // Calculate the number of working days
    const workingDays = calculateWorkingDays(
      requestData.startDate,
      requestData.endDate,
      holidays
    );
    
    if (workingDays <= 0) {
      throw new Error('Leave request must include at least one working day');
    }
    
    // Check if the leave type has a max duration
    if (leaveType.maxDuration && workingDays > leaveType.maxDuration) {
      throw new Error(`Maximum duration for ${leaveType.name} is ${leaveType.maxDuration} days`);
    }
    
    // Check for overlapping leave requests
    const overlappingRequests = await LeaveRequest.find({
      userId: requestData.userId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lte: requestData.endDate },
          endDate: { $gte: requestData.startDate }
        }
      ]
    });
    
    if (overlappingRequests.length > 0) {
      throw new Error('You already have a leave request for this period');
    }
    
    // Create the leave request
    const leaveRequest = new LeaveRequest({
      ...requestData,
      numberOfDays: workingDays
    });
    
    await leaveRequest.save();
    
    // Get manager info for notification
    const department = await Department.findOne({ departmentId: requestData.departmentId });
    
    if (department) {
      // Send email to employee
      await emailService({
        userName: requestData.userName,
        userEmail: requestData.userEmail,
        leaveType: leaveType.name,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        numberOfDays: workingDays
      }, 'leaveRequested');
      
      // Send email to manager
      await emailService({
        managerName: department.managerName,
        managerEmail: department.managerEmail,
        userName: requestData.userName,
        leaveType: leaveType.name,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        numberOfDays: workingDays,
        reason: requestData.reason
      }, 'leaveApprovalRequired');
    }
    
    return leaveRequest;
  } catch (error) {
    console.error('Error creating leave request:', error);
    throw error;
  }
};

// Approve a leave request
export const approveLeaveRequest = async (requestId, approverId, approverName) => {
  try {
    const leaveRequest = await LeaveRequest.findById(requestId);
    
    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }
    
    if (leaveRequest.status !== 'pending') {
      throw new Error('Leave request is not pending');
    }
    
    // Update request status
    leaveRequest.status = 'approved';
    leaveRequest.approvedBy = approverId;
    leaveRequest.approvalDate = new Date();
    
    await leaveRequest.save();
    
    // Update user's leave balance
    await updateBalanceForApprovedLeave(leaveRequest.userId, leaveRequest.numberOfDays);
    
    // Get leave type for notification
    const leaveType = await LeaveType.findById(leaveRequest.leaveTypeId);
    
    // Send approval email
    await emailService({
      userName: leaveRequest.userName,
      userEmail: leaveRequest.userEmail,
      leaveType: leaveType ? leaveType.name : 'Leave',
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      numberOfDays: leaveRequest.numberOfDays,
      approverName
    }, 'leaveApproved');
    
    return leaveRequest;
  } catch (error) {
    console.error('Error approving leave request:', error);
    throw error;
  }
};

// Reject a leave request
export const rejectLeaveRequest = async (requestId, approverId, approverName, rejectionReason) => {
  try {
    const leaveRequest = await LeaveRequest.findById(requestId);
    
    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }
    
    if (leaveRequest.status !== 'pending') {
      throw new Error('Leave request is not pending');
    }
    
    // Update request status
    leaveRequest.status = 'rejected';
    leaveRequest.approvedBy = approverId;
    leaveRequest.approvalDate = new Date();
    leaveRequest.rejectionReason = rejectionReason;
    
    await leaveRequest.save();
    
    // Get leave type for notification
    const leaveType = await LeaveType.findById(leaveRequest.leaveTypeId);
    
    // Send rejection email
    await emailService({
      userName: leaveRequest.userName,
      userEmail: leaveRequest.userEmail,
      leaveType: leaveType ? leaveType.name : 'Leave',
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      approverName,
      rejectionReason
    }, 'leaveRejected');
    
    return leaveRequest;
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    throw error;
  }
};

// Cancel a leave request
export const cancelLeaveRequest = async (requestId, userId) => {
  try {
    const leaveRequest = await LeaveRequest.findById(requestId);
    
    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }
    
    if (leaveRequest.userId !== userId) {
      throw new Error('You are not authorized to cancel this request');
    }
    
    if (leaveRequest.status !== 'pending') {
      throw new Error('Only pending requests can be canceled');
    }
    
    // Update request status
    leaveRequest.status = 'canceled';
    await leaveRequest.save();
    
    return leaveRequest;
  } catch (error) {
    console.error('Error canceling leave request:', error);
    throw error;
  }
};

// Get leave requests for a user
export const getUserLeaveRequests = async (userId) => {
  try {
    const requests = await LeaveRequest.find({ userId })
      .sort({ createdAt: -1 })
      .populate('leaveTypeId');
    
    return requests;
  } catch (error) {
    console.error('Error getting user leave requests:', error);
    throw error;
  }
};

// Get all leave requests for a department
export const getDepartmentLeaveRequests = async (departmentId) => {
  try {
    const requests = await LeaveRequest.find({ departmentId })
      .sort({ createdAt: -1 })
      .populate('leaveTypeId');
    
    return requests;
  } catch (error) {
    console.error('Error getting department leave requests:', error);
    throw error;
  }
};

// Get pending leave requests for a manager
export const getPendingLeaveRequests = async (departmentId) => {
  try {
    const requests = await LeaveRequest.find({ 
      departmentId,
      status: 'pending'
    })
    .sort({ createdAt: 1 })
    .populate('leaveTypeId');
    
    return requests;
  } catch (error) {
    console.error('Error getting pending leave requests:', error);
    throw error;
  }
};

// Get currently active leave requests (for team calendar)
export const getActiveLeaveRequests = async () => {
  try {
    const today = new Date();
    
    const requests = await LeaveRequest.find({
      status: 'approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    })
    .populate('leaveTypeId');
    
    return requests;
  } catch (error) {
    console.error('Error getting active leave requests:', error);
    throw error;
  }
};