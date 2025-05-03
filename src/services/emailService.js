import nodemailer from 'nodemailer';
import config from '../config/config.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPass
  },
  tls: {
    rejectUnauthorized: false
  }
});

const emailService = async (info, action) => {
  let subject;
  let emailTo;
  let composition;

  switch (action) {
    case 'leaveRequested':
      subject = 'Leave Request Submitted';
      emailTo = info.userEmail;
      composition = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #3498db;">Leave Request Submitted</h2>
          <p>Hello ${info.userName},</p>
          <p>Your leave request has been successfully submitted with the following details:</p>
          <ul>
            <li><strong>Leave Type:</strong> ${info.leaveType}</li>
            <li><strong>Start Date:</strong> ${new Date(info.startDate).toDateString()}</li>
            <li><strong>End Date:</strong> ${new Date(info.endDate).toDateString()}</li>
            <li><strong>Number of Days:</strong> ${info.numberOfDays}</li>
            <li><strong>Status:</strong> Pending Approval</li>
          </ul>
          <p>You will be notified once your request is reviewed.</p>
          <p>Thank you,<br>Leave Management System</p>
        </div>
      `;
      break;

    case 'leaveApprovalRequired':
      subject = 'Leave Approval Required';
      emailTo = info.managerEmail;
      composition = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #3498db;">Leave Approval Required</h2>
          <p>Hello ${info.managerName},</p>
          <p>A leave request requires your approval:</p>
          <ul>
            <li><strong>Employee:</strong> ${info.userName}</li>
            <li><strong>Leave Type:</strong> ${info.leaveType}</li>
            <li><strong>Start Date:</strong> ${new Date(info.startDate).toDateString()}</li>
            <li><strong>End Date:</strong> ${new Date(info.endDate).toDateString()}</li>
            <li><strong>Number of Days:</strong> ${info.numberOfDays}</li>
            <li><strong>Reason:</strong> ${info.reason}</li>
          </ul>
          <p>Please log in to the system to review this request.</p>
          <p>Thank you,<br>Leave Management System</p>
        </div>
      `;
      break;

    case 'leaveApproved':
      subject = 'Leave Request Approved';
      emailTo = info.userEmail;
      composition = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #2ecc71;">Leave Request Approved</h2>
          <p>Hello ${info.userName},</p>
          <p>Your leave request has been approved:</p>
          <ul>
            <li><strong>Leave Type:</strong> ${info.leaveType}</li>
            <li><strong>Start Date:</strong> ${new Date(info.startDate).toDateString()}</li>
            <li><strong>End Date:</strong> ${new Date(info.endDate).toDateString()}</li>
            <li><strong>Number of Days:</strong> ${info.numberOfDays}</li>
            <li><strong>Approved By:</strong> ${info.approverName}</li>
          </ul>
          <p>Enjoy your time off!</p>
          <p>Thank you,<br>Leave Management System</p>
        </div>
      `;
      break;

    case 'leaveRejected':
      subject = 'Leave Request Rejected';
      emailTo = info.userEmail;
      composition = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #e74c3c;">Leave Request Rejected</h2>
          <p>Hello ${info.userName},</p>
          <p>Unfortunately, your leave request has been rejected:</p>
          <ul>
            <li><strong>Leave Type:</strong> ${info.leaveType}</li>
            <li><strong>Start Date:</strong> ${new Date(info.startDate).toDateString()}</li>
            <li><strong>End Date:</strong> ${new Date(info.endDate).toDateString()}</li>
            <li><strong>Rejected By:</strong> ${info.approverName}</li>
            <li><strong>Reason for Rejection:</strong> ${info.rejectionReason}</li>
          </ul>
          <p>If you have any questions, please contact your manager or HR.</p>
          <p>Thank you,<br>Leave Management System</p>
        </div>
      `;
      break;

    case 'lowLeaveBalance':
      subject = 'Low Leave Balance Alert';
      emailTo = info.userEmail;
      composition = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #f39c12;">Low Leave Balance Alert</h2>
          <p>Hello ${info.userName},</p>
          <p>This is a friendly reminder that your leave balance is running low:</p>
          <ul>
            <li><strong>Current Balance:</strong> ${info.currentBalance} days</li>
          </ul>
          <p>Please plan your future leave requests accordingly.</p>
          <p>Thank you,<br>Leave Management System</p>
        </div>
      `;
      break;

    case 'carryOverExpiring':
      subject = 'Carry-Over Leave Expiring Soon';
      emailTo = info.userEmail;
      composition = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #f39c12;">Carry-Over Leave Expiring Soon</h2>
          <p>Hello ${info.userName},</p>
          <p>This is a reminder that your carry-over leave will expire soon:</p>
          <ul>
            <li><strong>Carry-Over Balance:</strong> ${info.carryOverBalance} days</li>
            <li><strong>Expiry Date:</strong> ${new Date(info.expiryDate).toDateString()}</li>
          </ul>
          <p>Please use your carry-over leave before the expiry date to avoid losing it.</p>
          <p>Thank you,<br>Leave Management System</p>
        </div>
      `;
      break;

    default:
      subject = 'Leave Management Notification';
      emailTo = info.email;
      composition = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #3498db;">Notification</h2>
          <p>Hello,</p>
          <p>${info.message || 'This is a notification from the Leave Management System.'}</p>
          <p>Thank you,<br>Leave Management System</p>
        </div>
      `;
      break;
  }

  const mailOptions = {
    from: `Leave Management System <${config.emailUser}>`,
    to: emailTo,
    subject,
    html: composition,
  };

  try {
    const sendEmail = await transporter.sendMail(mailOptions);
    return sendEmail;
  } catch (error) {
    console.error('Email sending error:', error);
    return error;
  }
};

export default emailService;