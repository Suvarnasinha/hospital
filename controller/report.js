// // const express = require("express");
// // const app = express();
// // const cron = require('node-cron');
// // const fs = require('fs');
// // const { Op } = require('sequelize');
// // const { medication,report,user } = require('../models');
// // const bodyParser = require("body-parser");
// // app.use(bodyParser.urlencoded({ extended: true }));
// // app.set("view engine", "ejs");
// // const {sendEmailNotification} = require("../service/email")


// // const reportgenrator = async () => {
// //   const filepath = '/home/suvarna-sinha/Documents/hospitalcsvvvvvvvvvv/'+ Date.now()+'.csv';
// //   const today= new Date();
// // let first = today.getDate() - today.getDay(); 
// // let last = first + 6; 
// // let startOfWeek = new Date(today.setDate(first)).toISOString().split('T')[0];
// // let endOfWeek = new Date(today.setDate(last)).toISOString().split('T')[0];
// //   // const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
// //   // const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6)).toISOString().split('T')[0];
// //   try {
// //     const medicationDetails = await medication.findAll({
// //       attributes: ['name', 'description', 'time', 'date', 'user.email', 'user.id'],
// //       raw: true,
// //       where: {
// //         date: { [Op.between]: [startOfWeek, endOfWeek] }
// //       },
// //       include: [user]
// //     });

// //     if (medicationDetails.length > 0) {
// //       let csvContent = 'Medicine Name,Medicine Date,Medicine Time\n';
// //       medicationDetails.forEach(element => {
// //         csvContent += `${element.name},${element.date},${element.time}\n`;
// //       });

// //       const descriptions = medicationDetails[0].description;
// //       fs.writeFile(filepath, csvContent, async (err) => {
// //         if (err) {
// //           console.log(err);
// //         } else {
// //           try {
// //             await report.create({
// //               user_id: medicationDetails[0].id,
// //               report_date: new Date(),
// //               description: descriptions
// //             });
// //             console.log("Data saved !!!");
// //             console.log(filepath);

// //             const recipientEmail = medicationDetails[0].email;
// //             const subject = 'Weekly Report';
// //             const text = `Here is your weekly report for the ${medicationDetails[0].description}`;
// //             sendEmailNotification(recipientEmail, subject, text, filepath);
// //           } catch (error) {
// //             console.log(error);
// //           }
// //         }
// //       });
// //     } else {
// //       console.log("No medication details found for the week.");
// //     }
// //   } catch (error) {
// //     console.error("Error generating report:", error);
// //   }
// // };

// // // Schedule the cron job to run weekly
// // cron.schedule('* * */7 * *', () => {
// //   console.log('Generating weekly report...');
// //   reportgenrator();
// // });

// // module.exports = { reportgenrator };



// const nodemailer = require('nodemailer');

// const sendEmailNotification = async (recipientEmail, subject, text, medicationId) => {
//   // Construct the email HTML template with the "Mark as Done" button
//   const emailTemplate = `
//     <p>${text}</p>
//     <a href="http://localhost:3000/markasdone/${medicationId}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #28a745; text-decoration: none; border-radius: 5px;">Mark as Done</a>
//   `;

//   // Configure the email transporter
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'suvarnasinha1502@gmail.com', 
//       pass: 'edkz pqcu yxsc wtij',
//     },
//   });

//   // Define the email options
//   const mailOptions = {
//     from: 'suvarnasinha1502@gmail.com',
//     to: recipientEmail,
//     subject: subject,
//     html: emailTemplate,
//   };

//   // Send the email
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${recipientEmail}`);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// module.exports = { sendEmailNotification };











// controller/reminder.js
// const express = require("express");
// const cron = require('node-cron');
// const { Op } = require('sequelize');
// const { medication, user, reminder } = require('../models');  // Ensure reminder is imported
// const { sendEmailNotification } = require("../service/email");

// const generateReminders = async () => {
//   const todayDate = new Date();
//   const dateWithoutTime = todayDate.toISOString().split('T')[0];
//   const todayDay = todayDate.toLocaleString('en-US', { weekday: 'long' });

//   try {
//     const allMedications = await medication.findAll({
//       include: [user],
//     });

//     if (allMedications) {
//       allMedications.forEach(async (medicationdetail) => {
//         if (
//           medicationdetail.type === 'one-time' &&
//           medicationdetail.date === dateWithoutTime &&
//           medicationdetail.time === medicationdetail.time
//         ) {
//           await reminder.create({
//             medication_id: medicationdetail.id,
//             reminder_at: new Date(`${medicationdetail.date} ${medicationdetail.time}`),
//             status: 'pending',
//           });

//           const recipientEmail = medicationdetail.user.email;
//           const subject = 'Medication Reminder';
//           const text = `Please remember to take your medication ${medicationdetail.name} at ${medicationdetail.time}.`;
//           sendEmailNotification(recipientEmail, subject, text, medicationdetail.id);
//         }

//         if (
//           medicationdetail.type === 'recurring' &&
//           medicationdetail.start_date <= todayDate &&
//           medicationdetail.end_date >= todayDate &&
//           medicationdetail.day_week === todayDay
//         ) {
//           await reminder.create({
//             medication_id: medicationdetail.id,
//             reminder_at: new Date(`${dateWithoutTime} ${medicationdetail.time}`),
//             status: 'pending',
//           });

//           const recipientEmail = medicationdetail.user.email;
//           const subject = 'Medication Reminder';
//           const text = `Please remember to take your medication ${medicationdetail.name} at ${medicationdetail.time}.`;
//           sendEmailNotification(recipientEmail, subject, text, medicationdetail.id);
//         }
//       });
//     } else {
//       console.log('No medication found');
//     }
//   } catch (error) {
//     console.error('Error generating reminders:', error);
//   }
// };

// // Schedule the cron job to run daily at midnight
// cron.schedule('0 0 * * *', function () {
//   console.log('Scheduled the cron to run daily at midnight');
//   generateReminders();
// });

// module.exports = { generateReminders };





// routes/medication.js
// const express = require('express');
// const router = express.Router();
// const { medication } = require('../models');

// // Add Medication Endpoint
// router.post('/addmedication', async (req, res) => {
//   const { name, description, type, date, start_date, end_date, time, day_week, rec_type } = req.body;
//   try {
//     const user_id = req.user.id;
//     let newMedication;
//     if (type === 'one-time') {
//       newMedication = await medication.create({
//         user_id,
//         name,
//         description,
//         type,
//         date,
//         time,
//         mark_as_done: 0,
//       });
//     } else if (type === 'recurring') {
//       if (rec_type === 'daily') {
//         newMedication = await medication.create({
//           user_id,
//           name,
//           description,
//           type,
//           rec_type,
//           start_date,
//           end_date,
//           time,
//           mark_as_done: 0,
//         });
//       }
//       if (rec_type === 'weekly') {
//         newMedication = await medication.create({
//           user_id,
//           name,
//           description,
//           type,
//           rec_type,
//           start_date,
//           end_date,
//           time,
//           day_week,
//           mark_as_done: 0,
//         });
//       }
//     } else {
//       return res.status(400).json({ error: 'Invalid medication type' });
//     }

//     const medicationdata = await medication.findAll({ where: { user_id } });
//     res.status(200).json({ message: 'Medication added successfully', medicationdata });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add medication' });
//   }
// });

// // Mark Medication as Done Endpoint
// router.post('/markasdone/:medication_id', async (req, res) => {
//   const { medication_id } = req.params;

//   try {
//     const updatedMedication = await medication.update(
//       { mark_as_done: true },
//       { where: { id: medication_id } }
//     );
//     res.status(200).json({ message: 'Medication marked as done successfully' });
//   } catch (error) {
//     console.error('Error marking medication as done:', error);
//     res.status(500).json({ error: 'Failed to mark medication as done' });
//   }
// });

// module.exports = router;



// server.js
// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const medicationRoutes = require('./routes/medication');
// const { generateReminders } = require('./controller/reminder');
// const { authenticate } = require('./middleware/authenticate');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/', medicationRoutes);

// // Schedule reminder generation
// generateReminders();

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });




// npm install bullmq ioredis



// queues/reportQueue.js
// const { Queue, Worker } = require('bullmq');
// const IORedis = require('ioredis');
// const { reportgenrator } = require('../controller/reminder');

// const connection = new IORedis();

// const reportQueue = new Queue('reportQueue', { connection });

// const worker = new Worker(
//   'reportQueue',
//   async job => {
//     await reportgenrator();
//   },
//   { connection }
// );

// worker.on('completed', job => {
//   console.log(`Job ${job.id} has completed!`);
// });

// worker.on('failed', (job, err) => {
//   console.log(`Job ${job.id} has failed with ${err.message}`);
// });

// module.exports = { reportQueue };






// controller/reminder.js
// const fs = require('fs');
// const { Op } = require('sequelize');
// const { medication, report, user } = require('../models');
// const { sendEmailNotification } = require("../service/email");

// const reportgenrator = async () => {
//   const filepath = '/home/suvarna-sinha/Documents/hospitalcsvvvvvvvvvv/' + Date.now() + '.csv';
//   const today = new Date();
//   let first = today.getDate() - today.getDay();
//   let last = first + 6;
//   let startOfWeek = new Date(today.setDate(first)).toISOString().split('T')[0];
//   let endOfWeek = new Date(today.setDate(last)).toISOString().split('T')[0];

//   try {
//     const medicationDetails = await medication.findAll({
//       attributes: ['name', 'description', 'time', 'date', 'user.email', 'user.id'],
//       raw: true,
//       where: {
//         date: { [Op.between]: [startOfWeek, endOfWeek] }
//       },
//       include: [user]
//     });

//     if (medicationDetails.length > 0) {
//       let csvContent = 'Medicine Name,Medicine Date,Medicine Time\n';
//       medicationDetails.forEach(element => {
//         csvContent += `${element.name},${element.date},${element.time}\n`;
//       });

//       const descriptions = medicationDetails[0].description;
//       fs.writeFile(filepath, csvContent, async (err) => {
//         if (err) {
//           console.log(err);
//         } else {
//           try {
//             await report.create({
//               user_id: medicationDetails[0].id,
//               report_date: new Date(),
//               description: descriptions
//             });
//             console.log("Data saved !!!");
//             console.log(filepath);

//             const recipientEmail = medicationDetails[0].email;
//             const subject = 'Weekly Report';
//             const text = `Here is your weekly report for the ${medicationDetails[0].description}`;
//             sendEmailNotification(recipientEmail, subject, text, filepath);
//           } catch (error) {
//             console.log(error);
//           }
//         }
//       });
//     } else {
//       console.log("No medication details found for the week.");
//     }
//   } catch (error) {
//     console.error("Error generating report:", error);
//   }
// };

// module.exports = { reportgenrator };




// server.js
// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const { reportQueue } = require('./queues/reportQueue');
// const medicationRoutes = require('./routes/medication');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/', medicationRoutes);

// // Schedule report generation using BullMQ
// const scheduleReportGeneration = async () => {
//   await reportQueue.add('generateReport', {});
// };

// // Add the job to the queue to run weekly
// scheduleReportGeneration();
// setInterval(scheduleReportGeneration, 7 * 24 * 60 * 60 * 1000); // Run every week

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });





const express = require('express');
const app = express();
const cron = require('node-cron');
const ejs = require('ejs');
const path = require('path');
const { medication, reminder, user } = require('../models');
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
                const reminderTime = new Date(`${medicationdetail.date}T${medicationdetail.time}`);
                const currentTime = new Date();

                if (medicationdetail.type === 'one-time' &&
                    medicationdetail.date === dateWithoutTime &&
                    reminderTime > currentTime) {
                    await reminder.create({
                        medication_id: medicationdetail.id,
                        reminder_at: reminderTime,
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
                    medicationdetail.day_week === todayDay &&
                    reminderTime > currentTime) {
                    await reminder.create({
                        medication_id: medicationdetail.id,
                        reminder_at: reminderTime,
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

// Schedule the cron job to run every minute
cron.schedule('* * * * *', function() {
    console.log('Scheduled the cron to run every minute');
    generateReminders();
});

module.exports = { generateReminders };




<!DOCTYPE html>
<html>
<head>
    <title>Medication Reminder</title>
</head>
<body>
    <p>Please remember to take your medication <strong><%= medication.name %></strong> at <strong><%= medication.time %></strong> on <strong><%= medication.date %></strong>.</p>
    <button onclick="markMedicationAsDone('<%= medication.id %>')">Mark as Done</button>

    <script>
        async function markMedicationAsDone(medicationId) {
            try {
                const response = await fetch("/markasdone/" + medicationId, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    alert("Medication marked as done successfully!");
                } else {
                    alert("Failed to mark medication as done.");
                }
            } catch (error) {
                console.error("Error marking medication as done:", error);
                alert("An error occurred while marking medication as done.");
            }
        }
    </script>
</body>
</html>




const express = require('express');
const router = express.Router();
const { markMedicationAsDone } = require('../controller/reminder');

router.post('/markasdone/:id', markMedicationAsDone);

module.exports = router;




const { medication } = require('../models');

const markMedicationAsDone = async (req, res) => {
    const { id } = req.params;

    try {
        const med = await medication.findByPk(id);
        if (med) {
            med.mark_as_done = 1;
            await med.save();
            res.status(200).json({ message: 'Medication marked as done successfully!' });
        } else {
            res.status(404).json({ message: 'Medication not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error marking medication as done.', error });
    }
};

module.exports = { generateReminders, markMedicationAsDone };
  