// const express = require("express");
// const app = express();
// app.set("view engine", "ejs");
// const bodyParser = require("body-parser");
// const { Op } = require("sequelize");
// const { medication, reminder, user } = require("../models");
const cron = require("node-cron");
// const { sendEmailNotification } = require("../service/email");

// const generateReminders = async () => {
//   const todayDate = new Date();
//   const dateWithoutTime = todayDate.toISOString().split("T")[0];
//   console.log(dateWithoutTime);
//   const todayDay = todayDate.toLocaleString("en-US", { weekday: "long" });
//   console.log("todayDay-" + todayDay);
  
//   try {
    
//     const allMedications = await medication.findAll({
//       include: [user],
//     });

    
//     if (allMedications) {
//       allMedications.forEach(async (medicationdetail) => {
        
//         if (medicationdetail.type === "one-time" && 
//         medicationdetail.date === dateWithoutTime && 
//         medicationdetail.time === medicationdetail.time) {
//           await reminder.create({
//             medication_id: medicationdetail.id,
//             reminder_at: new Date(`${medicationdetail.date} ${medicationdetail.time}`),
//             status: "pending",
//           });
//           console.log("Reminder created for one-time medication", medicationdetail.user.email);
         
//           const emailContent = `Please remember to take your medication ${medicationdetail.name} at ${medicationdetail.time}.
//           <a href="/markasdone/${medicationdetail.id}">Mark as Done</a>`;
  
         
         
//           const recipientEmail = medicationdetail.user.email;
//           const subject = 'Medication Reminder';
//           const text = emailContent
//           sendEmailNotification(recipientEmail, subject, text);
//         }

//         if (medicationdetail.type === "recurring" &&
//             medicationdetail.start_date <= todayDate &&
//             medicationdetail.end_date >= todayDate &&
//             medicationdetail.day_week === todayDay) {
//           await reminder.create({
//             medication_id: medicationdetail.id,
//             reminder_at: new Date(`${dateWithoutTime} ${medicationdetail.time}`),
//             status: "pending",
//           });

//           const emailContent = `Please remember to take your medication ${medicationdetail.name} at ${medicationdetail.time}.
//           <a href="/markasdone/${medicationdetail.id}">Mark as Done</a>`;


//           console.log(`Reminder created for recurring medication: ${medicationdetail.name}`);
//           const recipientEmail = medicationdetail.user.email;
//           const subject = 'Medication Reminder';
//           const text = `Please remember to take your medication ${medicationdetail.name} at ${medicationdetail.time}.`;

//           const emailTemplate = ejs.renderFile("views/reminderemail.ejs", { medicationId: medication.id });
//           sendEmailNotification(recipientEmail, subject, emailTemplate);
//         }
//       });
//     } else {
//       console.log("No medication found");
//     }
//   } catch (error) {
//     console.error("Error generating reminders:", error);
//   }
// };

// // Schedule the cron job to run daily at midnight
// cron.schedule("* * * * *", function() {
//   console.log("Scheduled the cron to run daily at midnight");
//   generateReminders();
// });

// module.exports = { generateReminders };





const ejs = require('ejs');
const path = require('path');
const { medication, reminder, user } = require("../models");
const { sendEmailNotification } = require('../service/email');

const generateReminders = async () => {
    const todayDate = new Date();
    const dateWithoutTime = todayDate.toISOString().split('T')[0];
    const todayDay = todayDate.toLocaleString('en-US', { weekday: 'long' });

    try {
        const allMedications = await medication.findAll({
            include: [user],
        });

        if (allMedications) {
            allMedications.forEach(async (medicationdetail) => {
                if (medicationdetail.type === 'one-time' &&
                    medicationdetail.date === dateWithoutTime &&
                   ) {
                    await reminder.create({
                        medication_id: medicationdetail.id,
                        reminder_at: new Date(`${medicationdetail.date} ${medicationdetail.time}`),
                        status: 'pending',
                    });
                    console.log('Reminder created for one-time medication', medicationdetail.user.email);
                    const recipientEmail = medicationdetail.user.email;
                    const subject = 'Medication Reminder';
                    const html = await ejs.renderFile(path.resolve(__dirname, '../views/reminder_email_template.ejs'), { medication: medicationdetail });
                    sendEmailNotification(recipientEmail, subject, html);
                }

                if (medicationdetail.type === 'recurring' &&
                    medicationdetail.start_date <= todayDate &&
                    medicationdetail.end_date >= todayDate &&
                    medicationdetail.day_week === todayDay) {
                    await reminder.create({
                        medication_id: medicationdetail.id,
                        reminder_at: new Date(`${dateWithoutTime} ${medicationdetail.time}`),
                        status: 'pending',
                    });
                    console.log(`Reminder created for recurring medication: ${medicationdetail.name}`);
                    const recipientEmail = medicationdetail.user.email;
                    const subject = 'Medication Reminder';
                    const html = await ejs.renderFile(path.resolve(__dirname, '../views/reminderemail.ejs'), { medication: medicationdetail });
                    sendEmailNotification(recipientEmail, subject, html);
                }
            });
        } else {
            console.log('No medication found');
        }
    } catch (error) {
        console.error('Error generating reminders:', error);
    }
};

// Schedule the cron job to run daily at midnight
cron.schedule('0 0 * * *', function() {
    console.log('Scheduled the cron to run daily at midnight');
    generateReminders();
});

module.exports = { generateReminders };
