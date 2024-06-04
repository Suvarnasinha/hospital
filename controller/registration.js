// const express = require("express");
// const app = express();
// const Sequelize = require("sequelize");
// app.set("view engine", "ejs");
// const router = express.Router();
// const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken');
// const bodyParser = require("body-parser");
// const { secretKey, loggedOutTokens } = require('../middleware/authenticate');
// const {user,medication}=require('../models')


// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());

// exports.getregister=async(req,res)=>{
//   res.render("registration");
// }
// exports.registration = async (req, res) => {
//   const { username,email, password } = req.body;

//   try {
//    const register=await user.create({
//     username,
//     email,
//     password,
//    });
//     //res.json({ message: 'User registered successfully' });
//     res.render("login")
//   } catch (error) {
//     res.json({ error });
//   }
// };

// exports.getlogin=async(req,res)=>{
//   res.render("login")
// }

// exports.login=async(req,res)=>{
//   try {
//     const { email } = req.body;
//     // const secretKey = 'secret_key';
//     const users = await user.findOne({ where: { email } });

//     if (!users) {
//       return res.status(401).json({ error: 'Invalid email' });
//     }
//     console.log(secretKey);
//     const token = jwt.sign({ id: users.id }, secretKey, { expiresIn: '3h' });
//   //  res.json({ user: users });
//     res.cookie('token', token, { httpOnly: true });
//     // console.log(token);
//     medicationdata = await medication.findAll();
//    res.render('dashboard', { medicationdata })
//     //res.status(200).json({ message: 'Logged in successfully' });
//   } catch (error) {
//     res.json({ error: error.message });
//   }
// }


// exports.logout = async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (token) {
//       // Add token to logged out tokens array
//       //loggedOutTokens.push(token);
//       res.clearCookie('token');
//     }
//     res.render("login")
//     // res.status(200).json({ message: 'Logged out successfully' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };


// exports.logoutalltheuser = async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (token) {
//       const user = jwt.verify(token, secretKey);
//       // Add all user's tokens to the logged out tokens array
//       const userTokens = await getAllUserTokens(user.id); // Implement this function to get all tokens
//       userTokens.forEach(userToken => loggedOutTokens.push(userToken));
//       res.clearCookie('token');
//     }
//     res.status(200).json({ message: 'Logged out from all devices' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };








const express = require("express");
const app = express();
const cron = require('node-cron');
const { Op } = require('sequelize');
const { medication, report, user } = require('../models');
const { sendEmailNotification } = require("../service/email");
const multer = require("multer");

app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/home/suvarna-sinha/Documents/hospitalcsvvvvvvvvvv/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const reportgenrator = async (req, res) => {
  try {
    // Generate CSV content based on medication details
    let csvContent = 'Medicine Name,Medicine Date,Medicine Time\n';
    const today = new Date();
    let first = today.getDate() - today.getDay(); 
    let last = first + 6; 
    const user_id = req.user.id;
    console.log(user_id);
    let startOfWeek = new Date(today.setDate(first)).toUTCString();
    let endOfWeek = new Date(today.setDate(last)).toUTCString();

    const medicationdetail = await medication.findAll({
      attributes: ['name', 'description', 'time', 'date', 'user.email'],
      raw: true,
      where: {
        date: { [Op.between]: [startOfWeek, endOfWeek] }
      },
      include: [user]
    });

    console.log("medicationdetail", medicationdetail)

    if (medicationdetail) {
      medicationdetail.forEach((element) => {
        csvContent += `${element.name},${element.date},${element.time}\n`;
      });

      // Use multer to handle file creation
      upload.single('report')(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to upload file' });
        }

        const filePath = req.file.path;

        try {
          const register = await report.create({
            user_id,
            report_date: new Date(),
            description: req.file.filename // Assuming file name as description
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'Failed to save report in database' });
        }

        console.log("Data saved !!!");
        console.log(filePath);

        const recipientEmail = medicationdetail[0].email;
        const subject = 'Weekly Report';
        const text = 'Here is your weekly report.';
        sendEmailNotification(recipientEmail, subject, text, filePath);
        res.status(200).json({ message: 'Report generated and sent successfully' });
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

cron.schedule('0 0 * * 0', () => {
  console.log('Making weekly report generation...');
  reportgenrator();
});

module.exports = { reportgenrator };
