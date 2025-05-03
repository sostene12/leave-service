import LeaveRequest from '../models/leaveRequest.model.js';
import Holiday from '../models/holiday.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// Get team calendar data
export const getTeamCalendar = async (req, res) => {
  try {
    const { departmentId, month, year } = req.query;
    
    // Set default to current month if not provided
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    
    // Create date range for the month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    
    // Query parameters
    const query = {
      status: 'approved',
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    };
    
    // Filter by department if provided
    if (departmentId) {
      query.departmentId = departmentId;
    }
    
    // Get approved leave requests in the date range
    const leaveRequests = await LeaveRequest.find(query)
      .populate('leaveTypeId')
      .sort({ startDate: 1 });
    
    // Get holidays in the date range
    const holidays = await Holiday.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
    
    // Format response
    const calendarData = {
      leaveRequests: leaveRequests.map(request => ({
        id: request._id,
        userId: request.userId,
        userName: request.userName,
        profilePicture: request.userProfilePicture,
        leaveType: request.leaveTypeId.name,
        color: request.leaveTypeId.color,
        startDate: request.startDate,
        endDate: request.endDate,
        numberOfDays: request.numberOfDays
      })),
      holidays: holidays.map(holiday => ({
        id: holiday._id,
        name: holiday.name,
        date: holiday.date,
        description: holiday.description
      }))
    };
    
    return successResponse(res, calendarData, 'Calendar data retrieved successfully');
  } catch (error) {
    console.error('Get team calendar error:', error);
    return errorResponse(res, 'Failed to retrieve calendar data', 500, error);
  }
};

// Create a holiday (admin only)
export const createHoliday = async (req, res) => {
  try {
    const { name, date, description, isRecurring, recurringDay, recurringMonth } = req.body;
    
    // Validate required fields
    if (!name || !date) {
      return errorResponse(res, 'Holiday name and date are required', 400);
    }
    
    // Check if holiday already exists on that date
    const existingHoliday = await Holiday.findOne({ date: new Date(date) });
    if (existingHoliday) {
      return errorResponse(res, 'A holiday already exists on this date', 400);
    }
    
    // Create new holiday
    const holiday = new Holiday({
      name,
      date: new Date(date),
      description,
      isRecurring,
      recurringDay: isRecurring ? new Date(date).getDate() : null,
      recurringMonth: isRecurring ? new Date(date).getMonth() : null
    });
    
    await holiday.save();
    
    return successResponse(res, holiday, 'Holiday created successfully', 201);
  } catch (error) {
    console.error('Create holiday error:', error);
    return errorResponse(res, 'Failed to create holiday', 500, error);
  }
};

// Get all holidays
export const getAllHolidays = async (req, res) => {
  try {
    const { year } = req.query;
    
    let query = {};
    
    // Filter by year if provided
    if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    const holidays = await Holiday.find(query).sort({ date: 1 });
    
    return successResponse(res, holidays, 'Holidays retrieved successfully');
  } catch (error) {
    console.error('Get holidays error:', error);
    return errorResponse(res, 'Failed to retrieve holidays', 500, error);
  }
};

// Update a holiday (admin only)
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, description, isRecurring } = req.body;
    
    const holiday = await Holiday.findById(id);
    
    if (!holiday) {
      return errorResponse(res, 'Holiday not found', 404);
    }
    
    // Update fields
    if (name) holiday.name = name;
    if (date) {
      holiday.date = new Date(date);
      if (isRecurring) {
        holiday.recurringDay = new Date(date).getDate();
        holiday.recurringMonth = new Date(date).getMonth();
      }
    }
    if (description !== undefined) holiday.description = description;
    if (isRecurring !== undefined) {
      holiday.isRecurring = isRecurring;
      if (!isRecurring) {
        holiday.recurringDay = null;
        holiday.recurringMonth = null;
      }
    }
    
    await holiday.save();
    
    return successResponse(res, holiday, 'Holiday updated successfully');
  } catch (error) {
    console.error('Update holiday error:', error);
    return errorResponse(res, 'Failed to update holiday', 500, error);
  }
};

// Delete a holiday (admin only)
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    
    const holiday = await Holiday.findById(id);
    
    if (!holiday) {
      return errorResponse(res, 'Holiday not found', 404);
    }
    
    await Holiday.findByIdAndDelete(id);
    
    return successResponse(res, null, 'Holiday deleted successfully');
  } catch (error) {
    console.error('Delete holiday error:', error);
    return errorResponse(res, 'Failed to delete holiday', 500, error);
  }
};