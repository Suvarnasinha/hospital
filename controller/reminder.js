const { Op } = require('sequelize');
const Medication = require('../models/medication');
const Reminder = require('../models/reminder');
const cron = require('node-cron');

// Schedule the cron job to run daily at midnight
exports.generateReminders = cron.schedule('0 0 * * *', async () => {
  const todayDate = new Date(); // Represents the current date and time
  todayDate.setHours(0, 0, 0, 0); // Set time to midnight (00:00:00)

  const todayDay = todayDate.toLocaleString('en-US', { weekday: 'long' });

  try {
    // Handle one-time medications
    const oneTimeMedications = await Medication.findAll({
      where: {
        type: 'one-time',
        date: todayDate
      }
    });

    oneTimeMedications.forEach(async (medication) => {
      await Reminder.create({
        medication_id: medication.id,
        reminder_at: new Date(`${medication.date} ${medication.time}`), // Convert to Date object
        status: 'pending'
      });
      console.log(`Reminder created for one-time medication: ${medication.name}`);
    });

    // Handle recurring medications
    const recurringMedications = await Medication.findAll({
      where: {
        type: 'recurring',
        start_date: { [Op.lte]: todayDate },
        end_date: { [Op.gte]: todayDate },
        day_week: { [Op.like]: `%${todayDay}%` }
      }
    });

    recurringMedications.forEach(async (medication) => {
      await Reminder.create({
        medication_id: medication.id,
        reminder_at: new Date(`${todayDate} ${medication.time}`), // Convert to Date object
        status: 'pending'
      });
      console.log(`Reminder created for recurring medication: ${medication.name}`);
    });
  } catch (error) {
    console.error('Error generating reminders:', error);
  }
});

console.log('Cron job for generating reminders is set up.');
