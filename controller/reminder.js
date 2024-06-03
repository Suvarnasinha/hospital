// reminder.js

const { sendEmailNotification } = require('./email'); // Import function for sending email notifications
const { medication, reminder } = require("../models");
const cron = require("node-cron");

// Function to generate reminders
const generateReminders = async (req, res) => {
  const todayDate = new Date();
  const dateWithoutTime = todayDate.toISOString().split('T')[0];
  console.log(dateWithoutTime);

  const todayDay = todayDate.toLocaleString("en-US", { weekday: "long" });
  console.log("todayDay-" + todayDay);

  try {
    const oneTimeMedications = await medication.findAll({
      where: {
        type: "one-time",
        [Op.and]: where(fn('DATE', col('date')), dateWithoutTime),
        deletedAt: null,
      },
    });

    if (oneTimeMedications.length > 0) {
      for (const medicationDetail of oneTimeMedications) {
        await reminder.create({
          medication_id: medicationDetail.id,
          reminder_at: new Date(`${medicationDetail.date} ${medicationDetail.time}`),
          status: "pending",
        });
        console.log(`Reminder created for one-time medication: ${medicationDetail.name}`);

        // Send email notification for one-time medication
        const recipientEmail = 'recipient@example.com';
        const subject = 'Medication Reminder';
        const text = `Please remember to take your medication ${medicationDetail.name}.`;
        sendEmailNotification(recipientEmail, subject, text);
      }
    } else {
      console.log("No one-time medications scheduled for today.");
    }

    // Additional code for recurring medications...
    
    res.status(200).json({ message: "Reminders generated successfully." });
  } catch (error) {
    console.error("Error generating reminders:", error);
    res.status(500).json({ error: "Error generating reminders" });
  }
};

// Schedule the cron job to run daily at midnight
cron.schedule("0 0 * * *", generateReminders);

console.log("Cron job for generating reminders is set up.");

module.exports = { generateReminders };
