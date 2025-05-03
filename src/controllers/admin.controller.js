import Department from '../models/department.model.js';
import LeaveType from '../models/leaveType.model.js';
import LeaveRequest from '../models/leaveRequest.model.js';
import LeaveBalance from '../models/leaveBalance.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// Create or update department
export const upsertDepartment = async (req, res) => {
  try {
    const { departmentId, name, managerId, managerName, managerEmail } = req.body;
    
    if (!departmentId || !name || !managerId || !managerName || !managerEmail) {
      return errorResponse(res, 'All department fields are required', 400);
    }
    
    let department = await Department.findOne({ departmentId });
    
    if (department) {
      // Update existing department
      department.name = name;
      department.managerId = managerId;
      department.managerName = managerName;
      department.managerEmail = managerEmail;
    } else {
      // Create new department
      department = new Department({
        departmentId,
        name,
        managerId,
        managerName,
        managerEmail
      });
    }
    
    await department.save();
    
    return successResponse(res, department, 'Department saved successfully');
  } catch (error) {
    console.error('Upsert department error:', error);
    return errorResponse(res, 'Failed to save department', 500, error);
  }
};

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    
    return successResponse(res, departments, 'Departments retrieved successfully');
  } catch (error) {
    console.error('Get departments error:', error);
    return errorResponse(res, 'Failed to retrieve departments', 500, error);
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id);
    
    if (!department) {
      return errorResponse(res, 'Department not found', 404);
    }
    
    await Department.findByIdAndDelete(id);
    
    return successResponse(res, null, 'Department deleted successfully');
  } catch (error) {
    console.error('Delete department error:', error);
    return errorResponse(res, 'Failed to delete department', 500, error);
  }
};

// Generate leave report
export const generateLeaveReport = async (req, res) => {
  try {
    const { departmentId, startDate, endDate, status, leaveTypeId } = req.query;
    
    // Build query
    const query = {};
    
    if (departmentId) {
      query.departmentId = departmentId;
    }
    
    if (startDate && endDate) {
      query.$or = [
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        {
          endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      ];
    } else if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (leaveTypeId) {
      query.leaveTypeId = leaveTypeId;
    }
    
    // Get leave requests
    const leaveRequests = await LeaveRequest.find(query)
      .populate('leaveTypeId')
      .sort({ createdAt: -1 });
    
    // Format report data
    const reportData = leaveRequests.map(request => ({
      id: request._id,
      employeeId: request.userId,
      employeeName: request.userName,
      email: request.userEmail,
      departmentId: request.departmentId,
      leaveType: request.leaveTypeId ? request.leaveTypeId.name : 'Unknown',
      startDate: request.startDate,
      endDate: request.endDate,
      numberOfDays: request.numberOfDays,
      reason: request.reason,
      status: request.status,
      approvedBy: request.approvedBy,
      approvalDate: request.approvalDate,
      submissionDate: request.createdAt
    }));
    
    return successResponse(res, reportData, 'Leave report generated successfully');
  } catch (error) {
    console.error('Generate leave report error:', error);
    return errorResponse(res, 'Failed to generate leave report', 500, error);
  }
};

// Generate leave balance report
export const generateBalanceReport = async (req, res) => {
  try {
    const { departmentId } = req.query;
    
    // Build query
    const query = {};
    
    if (departmentId) {
      query.departmentId = departmentId;
    }
    
    // Get leave balances
    const leaveBalances = await LeaveBalance.find(query);
    
    // Format report data
    const reportData = leaveBalances.map(balance => ({
      userId: balance.userId,
      userName: balance.userName,
      email: balance.userEmail,
      departmentId: balance.departmentId,
      totalBalance: balance.totalBalance,
      usedBalance: balance.usedBalance,
      availableBalance: balance.totalBalance - balance.usedBalance,
      carryOverBalance: balance.carryOverBalance,
      carryOverExpiryDate: balance.carryOverExpiryDate
    }));
    
    return successResponse(res, reportData, 'Balance report generated successfully');
  } catch (error) {
    console.error('Generate balance report error:', error);
    return errorResponse(res, 'Failed to generate balance report', 500, error);
  }
};