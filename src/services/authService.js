import axios from 'axios';
import config from '../config/config.js';

// Get user information from the Auth Service
export const getUserInfo = async (token) => {
  try {
    const response = await axios.get(`${config.authServiceUrl}/auth/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw new Error('Failed to fetch user information');
  }
};

// Verify if a token is valid
export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${config.authServiceUrl}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.valid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};