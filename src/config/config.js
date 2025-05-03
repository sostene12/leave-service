import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT,
  mongodbUrl: process.env.MONGODB_URL,
  authServiceUrl: process.env.AUTH_SERVICE_URL,
  jwtSecret: process.env.JWT_SECRET,
  emailUser: process.env.SEND_MAIL,
  emailPass: process.env.PASS_MAIL,
  defaultPtoAllowance: 20, // 20 days per year
  monthlyAccrualRate: 1.66, // 1.66 days per month
  maxCarryOverDays: 5, // Maximum 5 days carried over to next year
  yearEndDate: '12-31', // December 31st
  carryOverExpiryDate: '01-31', // January 31st
};