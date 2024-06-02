const cron = require('node-cron');
const fs = require('fs');
const { Op } = require('sequelize');
const { Medication } = require('./models');

// Function to generate the CSV report
const generateReport = async () => {
  const filePath = `./reports/report_${Date.now()}.csv`;

  try {
    // Calculate start and end dates of the current week
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    // Fetch medication data from the database for the current week
    const medications = await Medication.findAll({
      where: {
        date: {
          [Op.between]: [startOfWeek, endOfWeek]
        }
      }
    });

    // Create a CSV string with headers
    let csvContent = 'Medicine Name,Date,Time,Mark as Done\n';

    // Append medication data to the CSV string
    medications.forEach(item => {
      csvContent += `${item.name},${item.date},${item.time},${item.mark_as_done}\n`;
    });

    // Write CSV content to file
    fs.writeFileSync(filePath, csvContent);

    console.log(`Report generated: ${filePath}`);
  } catch (error) {
    console.error('Error generating report:', error);
  }
};

// Schedule the cron job to run every week (Sunday at midnight)
cron.schedule('0 0 * * 0', () => {
  console.log('Running weekly report generation...');
  generateReport();
});
