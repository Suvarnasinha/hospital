const express = require("express");
const app = express();
const Sequelize = require("sequelize");
app.set("view engine", "ejs");
const router = express.Router();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const { secretKey, loggedOutTokens } = require('../middleware/authenticate');
const {user,medication,session}=require('../models')


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

exports.getregister=async(req,res)=>{
  res.render("registration");
}
exports.registration = async (req, res) => {
  const { username,email, password } = req.body;

  try {
   const register=await user.create({
    username,
    email,
    password,
   });
    res.render("login")
  } catch (error) {
    res.json({ error });
  }
};

exports.getlogin=async(req,res)=>{
  res.render("login")
}

// exports.login=async(req,res)=>{
//   try {
//     const { email } = req.body;

//     const users = await user.findOne({ where: { email } });

//     if (!users) {
//       return res.status(401).json({ error: 'Invalid email' });
//     }
//     console.log(secretKey);
//     const token = jwt.sign({ id: users.id }, secretKey, { expiresIn: '3h' });
//     res.cookie('token', token, { httpOnly: true });
//     console.log("object",token);
//     const sessions=await session.create({
//       user_id:users.id,
//       session_token:token
//      });
//     console.log(sessions);
//     medicationdata = await medication.findAll();
//    res.render('dashboard', { medicationdata })
//     res.status(200).json({ message: 'Logged in successfully' });
//   } catch (error) {
//     res.json({ error: error.message });
//   }
// }

exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    const users = await user.findOne({ where: { email } });

    if (!users) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    const token = jwt.sign({ id: users.id }, secretKey, { expiresIn: '3h' });
    res.cookie('token', token, { httpOnly: true });

    // Retrieve medication data for the logged-in user
    const medicationdata = await medication.findAll({ where: { user_id: users.id } });

    res.render('dashboard', { userMedications: medicationdata });
  } catch (error) {
    res.json({ error: error.message });
  }
};


//   exports.dashboard=async(req,res)=>{
//     medicationdata = await medication.findAll();
//     userdetail=await user.findAll({
     
//     });
//     res.render('dashboard', { medicationdata,userdetail })
   
     
// };



exports.dashboard = async (req, res) => {
  // Assuming the logged-in user's information is available in req.user
  const userId = req.user.id;

  try {
      // Fetch medication data associated with the logged-in user
      const userMedications = await medication.findAll({
          where: {
              user_id: userId // Assuming there's a field user_id in the medication table
          }
      });

      res.render('dashboard', { userMedications });

  } catch (error) {
      console.error("Error fetching user medications:", error);
      res.status(500).send("Error fetching user medications");
  }
};



exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    const result = await session.destroy({
      where: { user_id: req.user.id, session_token: token },
    });
    res.clearCookie("token");
    res.redirect('/login');
  } catch (error) {
    console.log("logout from own function: "+error);
  }
};


exports.logoutalltheuser = async (req, res) => {
  try {
    const token = req.cookies.token;
    const result = await session.destroy({
      where: { user_id: req.user.id },
    });
    res.clearCookie("token");
    res.redirect('/login');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.logoutothersevice = async (req, res) => {
  try {
    const token = req.cookies.token;
    user_id = req.user.id
    const result = await session.destroy({
      where: {
        [Op.or]: {
          user_id: { [Op.ne]: user_id },
          session_token: { [Op.ne]: token },
        },
      },
    })
    res.clearCookie("token");
    res.redirect('/login');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};