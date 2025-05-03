import { 
    getOrCreateBalance, 
    processAccruals, 
    processYearEndCarryOver, 
    processExpiringCarryOvers, 
    adjustBalance 
  } from '../services/balanceService.js';
  import LeaveBalance from '../models/leaveBalance.model.js';
  import { successResponse, errorResponse } from '../utils/responseHandler.js';
  
  // Get user leave balance
  export const getUserLeaveBalance = async (req, res) => {
    try {
      const userId = req.params.userId || req.user.userId;
      const userName = req.user.name;
      const userEmail = req.user.email;
      const departmentId = req.user.departmentId;

      console.log('User ID:', userId);
      console.log('User Name:', userName);
      console.log('User Email:', userEmail);
      console.log('Department ID:', departmentId);
      
      const balance = await getOrCreateBalance(userId, userName, userEmail, departmentId);
      
      return successResponse(res, {
        totalBalance: balance.totalBalance,
        usedBalance: balance.usedBalance,
        availableBalance: balance.totalBalance - balance.usedBalance,
        carryOverBalance: balance.carryOverBalance,
        carryOverExpiryDate: balance.carryOverExpiryDate,
        lastAccrualDate: balance.lastAccrualDate,
        balanceHistory: balance.balanceHistory
      }, 'Leave balance retrieved successfully');
    } catch (error) {
      console.error('Get user leave balance error:', error);
      return errorResponse(res, 'Failed to retrieve leave balance', 500, error);
    }
  };
  
  // Manually adjust leave balance (admin only)
  export const adjustLeaveBalance = async (req, res) => {
    try {
      const { userId, amount, reason } = req.body;
      const adjustedBy = req.user.userId;
      
      if (!userId || amount === undefined || !reason) {
        return errorResponse(res, 'User ID, amount, and reason are required', 400);
      }
      
      const result = await adjustBalance(userId, amount, reason, adjustedBy);
      
      return successResponse(res, result, 'Leave balance adjusted successfully');
    } catch (error) {
      console.error('Adjust leave balance error:', error);
      return errorResponse(res, 'Failed to adjust leave balance', 500, error);
    }
  };
  
  // Process accruals manually (admin only)
  export const processAccrualsManually = async (req, res) => {
    try {
      const balances = await LeaveBalance.find({});
      const results = [];
      
      for (const balance of balances) {
        const updated = await processAccruals(balance);
        results.push({
          userId: updated.userId,
          userName: updated.userName,
          newBalance: updated.totalBalance
        });
      }
      
      return successResponse(res, results, 'Accruals processed successfully');
    } catch (error) {
      console.error('Process accruals error:', error);
      return errorResponse(res, 'Failed to process accruals', 500, error);
    }
  };
  
  // Process year-end carry over manually (admin only)
  export const processYearEndCarryOverManually = async (req, res) => {
    try {
      const result = await processYearEndCarryOver();
      
      return successResponse(res, result, 'Year-end carry over processed successfully');
    } catch (error) {
      console.error('Process year-end carry over error:', error);
      return errorResponse(res, 'Failed to process year-end carry over', 500, error);
    }
  };
  
  // Process expiring carry over balances manually (admin only)
  export const processExpiringCarryOversManually = async (req, res) => {
    try {
      const result = await processExpiringCarryOvers();
      
      return successResponse(res, result, 'Expiring carry overs processed successfully');
    } catch (error) {
      console.error('Process expiring carry overs error:', error);
      return errorResponse(res, 'Failed to process expiring carry overs', 500, error);
    }
  };