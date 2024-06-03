// email.js

const nodemailer = require('nodemailer');

// Function to send email notifications
const sendEmailNotification = async (recipientEmail, subject, text, attachment = null) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // Your Gmail email address
        pass: 'your-app-password', // Your Gmail app password (generated for SMTP)
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com', // Your Gmail email address
      to: recipientEmail,
      subject: subject,
      text: text,
      attachments: attachment ? [{ path: attachment }] : [], // Attach file if provided
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

module.exports = { sendEmailNotification };






// report.js

const { sendEmailNotification } = require('./email'); // Import function for sending email notifications
const fs = require('fs');
const { Op } = require('sequelize');
const { medication } = require('../models');
const cron = require('node-cron');

// Function to generate report
const reportgenrator = async (req, res) => {
  // Your existing code for generating reports
  
  // Send email notification for report
  const recipientEmail = 'recipient@example.com';
  const subject = 'Weekly Report';
  const text = 'Here is your weekly report.';
  const attachment = filepath; // Path to the generated CSV file
  sendEmailNotification(recipientEmail, subject, text, attachment);

  res.status(200).json({ message: "Report generated successfully." });
};

cron.schedule('0 0 * * 0', () => {
  console.log('Making weekly report generation...');
  // generateReport();
});

module.exports = { reportgenrator };
