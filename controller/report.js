const multer = require('multer');
const fs = require('fs');
const { Op } = require('sequelize');
const { medication } = require('../models');
const cron = require('node-cron');

// Set up Multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'D:\csvhospital');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const reportgenrator = async (req, res) => {
   // Assuming you don't need req and res here
   const filepath = 'D:\csvhospital' + Date.now() + '.csv';
   const today = new Date();
   var first = today.getDate() - today.getDay();
   var last = first + 6;
 
   var startOfWeek = new Date(today.setDate(first)).toUTCString();
   var endOfWeek = new Date(today.setDate(last)).toUTCString();
 
   const medicationdetail = await medication.findAll({
     where: {
       date: { [Op.between]: [startOfWeek, endOfWeek] }
     }
   });
 
   if (medicationdetail) {
     let csvContent = 'Medicine Name,Date,Time\n';
     medicationdetail.forEach((element) => {
       csvContent += `${element.name},${element.date},${element.time}\n`;
     });
 
     fs.writeFile(filepath, csvContent, (err) => {
       if (err) {
         console.log(err);
         res.status(500).send("Error saving file");
       } else {
         console.log("Data saved");
         console.log(filepath);
         res.status(200).send("File saved successfully");
       }
     });
   }
};

cron.schedule('0 0 * * 0', () => {
  console.log('making weekly report generation...');
  // generateReport();
});

module.exports = { upload,reportgenrator };
