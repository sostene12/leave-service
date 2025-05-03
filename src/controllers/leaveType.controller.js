import LeaveType from '../models/leaveType.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// Create a new leave type
export const createLeaveType = async (req, res) => {
  try {
    const { name, description, requiresDocumentation, maxDuration, color } = req.body;
    
    // Check if leave type already exists
    const existingType = await LeaveType.findOne({ name });
    if (existingType) {
      return errorResponse(res, 'Leave type already exists', 400);
    }
    
    // Create new leave type
    const leaveType = new LeaveType({
      name,
      description,
      requiresDocumentation,
      maxDuration,
      color
    });
    
    await leaveType.save();
    
    return successResponse(res, leaveType, 'Leave type created successfully', 201);
  } catch (error) {
    console.error('Create leave type error:', error);
    return errorResponse(res, 'Failed to create leave type', 500, error);
  }
};

// Get all leave types
export const getAllLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find({ isActive: true });
    
    return successResponse(res, leaveTypes, 'Leave types retrieved successfully');
  } catch (error) {
    console.error('Get leave types error:', error);
    return errorResponse(res, 'Failed to retrieve leave types', 500, error);
  }
};

// Get leave type by ID
export const getLeaveTypeById = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    
    if (!leaveType) {
      return errorResponse(res, 'Leave type not found', 404);
    }
    
    return successResponse(res, leaveType, 'Leave type retrieved successfully');
  } catch (error) {
    console.error('Get leave type error:', error);
    return errorResponse(res, 'Failed to retrieve leave type', 500, error);
  }
};

// Update leave type
export const updateLeaveType = async (req, res) => {
  try {
    const { name, description, requiresDocumentation, maxDuration, isActive, color } = req.body;
    
    const leaveType = await LeaveType.findById(req.params.id);
    
    if (!leaveType) {
      return errorResponse(res, 'Leave type not found', 404);
    }
    
    // Update fields
    if (name) leaveType.name = name;
    if (description) leaveType.description = description;
    if (requiresDocumentation !== undefined) leaveType.requiresDocumentation = requiresDocumentation;
    if (maxDuration !== undefined) leaveType.maxDuration = maxDuration;
    if (isActive !== undefined) leaveType.isActive = isActive;
    if (color) leaveType.color = color;
    
    await leaveType.save();
    
    return successResponse(res, leaveType, 'Leave type updated successfully');
  } catch (error) {
    console.error('Update leave type error:', error);
    return errorResponse(res, 'Failed to update leave type', 500, error);
  }
};

// Delete leave type
export const deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    
    if (!leaveType) {
      return errorResponse(res, 'Leave type not found', 404);
    }
    
    // Soft delete by setting isActive to false
    leaveType.isActive = false;
    await leaveType.save();
    
    return successResponse(res, null, 'Leave type deleted successfully');
  } catch (error) {
    console.error('Delete leave type error:', error);
    return errorResponse(res, 'Failed to delete leave type', 500, error);
  }
};