import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import axios from 'axios';

// Verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication token is required' 
      });
    }

    try {
      // Verify locally first
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      
      // Check with Auth Service to ensure token is still valid
      // Disabled for now - can be enabled if needed
      /*
      const response = await axios.get(`${config.authServiceUrl}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.valid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }
      */
      
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Check if user has staff role
export const isStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'User not authenticated' 
    });
  }
  
  // Allow any role (STAFF, MANAGER, ADMIN)
  next();
};

// Check if user has manager role
export const isManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'User not authenticated' 
    });
  }
  
  // Check if user is a manager or admin
  if (req.user.role !== 'MANAGER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Requires manager privileges' 
    });
  }
  
  next();
};

// Check if user has admin role
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'User not authenticated' 
    });
  }
  
  // Check if user is an admin
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Requires admin privileges' 
    });
  }
  
  next();
};