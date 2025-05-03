import LeaveBalance from '../models/leaveBalance.model.js';
import config from '../config/config.js';
import { calculateYearEndDate, calculateCarryOverExpiryDate } from '../utils/dateUtils.js';
import emailService from './emailService.js';

// Initialize or get a user's leave balance
export const getOrCreateBalance = async (userId, userName, userEmail, departmentId) => {
  try {
    let balance = await LeaveBalance.findOne({ userId });
    
    if (!balance) {
      // Create new balance record
      balance = new LeaveBalance({
        userId,
        userName,
        userEmail,
        departmentId,
        totalBalance: 0, // Start with 0, will accrue monthly
        usedBalance: 0,
        carryOverBalance: 0,
        lastAccrualDate: new Date(),
        balanceHistory: [{
          date: new Date(),
          action: 'accrual',
          amount: 0,
          reason: 'Initial balance setup',
          performedBy: 'system'
        }]
      });
      
      await balance.save();
    }
    
    // Process any pending accruals
    return await processAccruals(balance);
  } catch (error) {
    console.error('Error getting/creating balance:', error);
    throw error;
  }
};

// Process monthly accruals
export const processAccruals = async (balance) => {
  try {
    const now = new Date();
    const lastAccrual = new Date(balance.lastAccrualDate);
    
    // Calculate months since last accrual
    const monthsSinceLastAccrual = 
      (now.getFullYear() - lastAccrual.getFullYear()) * 12 + 
      (now.getMonth() - lastAccrual.getMonth());
    
    if (monthsSinceLastAccrual < 1) {
      return balance; // No accrual needed yet
    }
    
    // Calculate accrual amount (max 12 months to prevent excessive accruals)
    const accrualMonths = Math.min(monthsSinceLastAccrual, 12);
    const accrualAmount = Number((config.monthlyAccrualRate * accrualMonths).toFixed(2));
    
    // Update balance
    balance.totalBalance += accrualAmount;
    balance.lastAccrualDate = now;
    
    // Add to history
    balance.balanceHistory.push({
      date: now,
      action: 'accrual',
      amount: accrualAmount,
      reason: `Monthly accrual (${accrualMonths} months)`,
      performedBy: 'system'
    });
    
    await balance.save();
    return balance;
  } catch (error) {
    console.error('Error processing accruals:', error);
    throw error;
  }
};

// Process year-end carry over
export const processYearEndCarryOver = async () => {
  try {
    const now = new Date();
    const yearEndDate = calculateYearEndDate(now.getFullYear() - 1); // Previous year
    
    // Only process if we're after year end
    if (now <= yearEndDate) {
      return { processed: 0 };
    }
    
    // Get all balances
    const balances = await LeaveBalance.find({});
    let processedCount = 0;
    
    for (const balance of balances) {
      // Calculate available balance (total - used)
      const availableBalance = balance.totalBalance - balance.usedBalance;
      
      // Process carry over
      if (availableBalance > 0) {
        const carryOverAmount = Math.min(availableBalance, config.maxCarryOverDays);
        const expiryDate = calculateCarryOverExpiryDate(now.getFullYear());
        
        // Update balance
        balance.carryOverBalance = carryOverAmount;
        balance.carryOverExpiryDate = expiryDate;
        balance.totalBalance = carryOverAmount; // Reset total balance
        balance.usedBalance = 0; // Reset used balance
        
        // Add to history
        balance.balanceHistory.push({
          date: now,
          action: 'carryover',
          amount: carryOverAmount,
          reason: `Year-end carry over (${now.getFullYear() - 1} to ${now.getFullYear()})`,
          performedBy: 'system'
        });
        
        // If there was excess balance that couldn't be carried over
        if (availableBalance > config.maxCarryOverDays) {
          const expiredAmount = availableBalance - config.maxCarryOverDays;
          
          balance.balanceHistory.push({
            date: now,
            action: 'expiry',
            amount: -expiredAmount,
            reason: `Expired balance exceeding carry-over limit`,
            performedBy: 'system'
          });
        }
        
        await balance.save();
        processedCount++;
        
        // Notify user about carry over
        await emailService({
          userName: balance.userName,
          userEmail: balance.userEmail,
          carryOverBalance: carryOverAmount,
          expiryDate
        }, 'carryOverExpiring');
      }
    }
    
    return { processed: processedCount };
  } catch (error) {
    console.error('Error processing year-end carry-over:', error);
    throw error;
  }
};

// Check for expiring carry-over balances
export const processExpiringCarryOvers = async () => {
  try {
    const now = new Date();
    const balances = await LeaveBalance.find({
      carryOverBalance: { $gt: 0 },
      carryOverExpiryDate: { $lt: now }
    });
    
    let processedCount = 0;
    
    for (const balance of balances) {
      const expiredAmount = balance.carryOverBalance;
      
      // Update balance
      balance.totalBalance -= expiredAmount;
      balance.carryOverBalance = 0;
      
      // Add to history
      balance.balanceHistory.push({
        date: now,
        action: 'expiry',
        amount: -expiredAmount,
        reason: 'Carry-over balance expired',
        performedBy: 'system'
      });
      
      await balance.save();
      processedCount++;
    }
    
    return { expired: processedCount };
  } catch (error) {
    console.error('Error processing expiring carry-overs:', error);
    throw error;
  }
};

// Update balance after leave request approval
export const updateBalanceForApprovedLeave = async (userId, days) => {
  try {
    const balance = await LeaveBalance.findOne({ userId });
    
    if (!balance) {
      throw new Error('User balance not found');
    }
    
    // Update used balance
    balance.usedBalance += days;
    
    // Add to history
    balance.balanceHistory.push({
      date: new Date(),
      action: 'used',
      amount: -days,
      reason: 'Approved leave request',
      performedBy: 'system'
    });
    
    // Check if balance is low and notify
    const remainingBalance = balance.totalBalance - balance.usedBalance;
    if (remainingBalance <= 5) {
      await emailService({
        userName: balance.userName,
        userEmail: balance.userEmail,
        currentBalance: remainingBalance
      }, 'lowLeaveBalance');
    }
    
    await balance.save();
    return balance;
  } catch (error) {
    console.error('Error updating balance for approved leave:', error);
    throw error;
  }
};

// Adjust a user's balance manually (by admin)
export const adjustBalance = async (userId, amount, reason, adjustedBy) => {
  try {
    const balance = await LeaveBalance.findOne({ userId });
    
    if (!balance) {
      throw new Error('User balance not found');
    }
    
    // Update balance
    balance.totalBalance += amount;
    
    // Add to history
    balance.balanceHistory.push({
      date: new Date(),
      action: 'adjustment',
      amount,
      reason,
      performedBy: adjustedBy
    });
    
    await balance.save();
    return balance;
  } catch (error) {
    console.error('Error adjusting balance:', error);
    throw error;
  }
};