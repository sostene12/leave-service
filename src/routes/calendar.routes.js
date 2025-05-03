import express from 'express';
import {
  getTeamCalendar,
  createHoliday,
  getAllHolidays,
  updateHoliday,
  deleteHoliday
} from '../controllers/calendar.controller.js';
import { verifyToken, isStaff, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route to get team calendar data
router.get('/', verifyToken, isStaff, getTeamCalendar);

// Route to get all holidays
router.get('/holidays', verifyToken, isStaff, getAllHolidays);

// Route to create a holiday (admin only)
router.post('/holidays', verifyToken, isAdmin, createHoliday);

// Route to update a holiday (admin only)
router.put('/holidays/:id', verifyToken, isAdmin, updateHoliday);

// Route to delete a holiday (admin only)
router.delete('/holidays/:id', verifyToken, isAdmin, deleteHoliday);

export default router;