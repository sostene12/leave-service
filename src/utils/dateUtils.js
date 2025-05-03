import config from '../config/config.js';

// Calculate the number of working days between two dates
export const calculateWorkingDays = (startDate, endDate, holidays = []) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Ensure dates are in correct order
  if (start > end) {
    return 0;
  }
  
  let dayCount = 0;
  const currentDate = new Date(start);
  
  // Convert holidays to date strings for easier comparison
  const holidayDates = holidays.map(holiday => new Date(holiday.date).toDateString());
  
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // 0 = Sunday, 6 = Saturday
    const isHoliday = holidayDates.includes(currentDate.toDateString());
    
    if (!isWeekend && !isHoliday) {
      dayCount++;
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dayCount;
};

// Calculate the year's end date
export const calculateYearEndDate = (year = new Date().getFullYear()) => {
  const [month, day] = config.yearEndDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Calculate the carry-over expiry date for a given year
export const calculateCarryOverExpiryDate = (year = new Date().getFullYear() + 1) => {
  const [month, day] = config.carryOverExpiryDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Check if two date ranges overlap
export const datesOverlap = (startDate1, endDate1, startDate2, endDate2) => {
  const start1 = new Date(startDate1);
  const end1 = new Date(endDate1);
  const start2 = new Date(startDate2);
  const end2 = new Date(endDate2);
  
  return start1 <= end2 && start2 <= end1;
};