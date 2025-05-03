import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from "swagger-ui-express";
import cors from 'cors';
import { connectDb } from './database/dbconnect.js';
import { swaggerSpecs } from './config/swagger.js';
import leaveTypeRoutes from './routes/leaveType.routes.js';
import leaveRequestRoutes from './routes/leaveRequest.routes.js';
import leaveBalanceRoutes from './routes/leaveBalance.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Leave Management Service API',
    status: 'active',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/leave-balances', leaveBalanceRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Leave Management Service is running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
  connectDb();
});