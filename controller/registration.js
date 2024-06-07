const express = require("express");
const app = express();
const Sequelize = require("sequelize");
app.set("view engine", "ejs");
const router = express.Router();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { loggedOutTokens } = require("../middleware/authenticate");
const { user, medication, session } = require("../models");
const { Op } = require("sequelize");

require("dotenv").config();

// const secretKey = process.env.SECRET_KEY;
const secretKey='secret_key'

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

exports.getregister = async (req, res) => {
  res.render("registration");
};

exports.registration = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const newUser = await user.create({
      username,
      email,
      password,
    });
    // Send a success response
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    // Send an error response
    res.status(500).json({ error: error.message });
  }
};



exports.forgetpassword = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const forgetPassword = await user.update(
      { password: password },
      { where: { email: email } }
    );
    // if (forgetPassword[0] === 1) { // Check if any row got updated
      console.log('Password updated successfully');
      res.status(200).json({ message: 'Password updated successfully' });
    // } else {
    //   res.status(404).json({ message: 'Email not found' });
    // }
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Error updating password' });
  }
};

// Function to render the forget password page
exports.getforgetpassword = (req, res) => {
  res.render('forgetpassword');
};

exports.getlogin = async (req, res) => {
  res.render("login");
};

exports.login = async (req, res) => {
  // try {
  const { email } = req.body;
  console.log(req.body);
  const users = await user.findOne({ where: { email } });

  if (!users) {
    return res.status(401).json({ error: "Invalid email" });
  }
  console.log(users);
  const token = jwt.sign({ id: users.id }, secretKey, { expiresIn: "3h" });
  res.cookie("token", token, { httpOnly: true });
  console.log("token", token);
  res.json({ token });
  //   // Retrieve medication data for the logged-in user
  //   const medicationdata = await medication.findAll({ where: { user_id: users.id } });

  //   res.render('dashboard', { userMedications: medicationdata });
  // } catch (error) {
  //   res.json({ error: error.message });
  // }
};

exports.dashboard = async (req, res) => {
  // Assuming the logged-in user's information is available in req.user
  const userId = req.user.id;

  try {
    // Fetch medication data associated with the logged-in user
    const userMedications = await medication.findAll({
      where: {
        user_id: userId, // Assuming there's a field user_id in the medication table
      },
    });

    res.render("dashboard", { userMedications });
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
    res.redirect("/login");
  } catch (error) {
    console.log("logout from own function: " + error);
  }
};

exports.logoutalltheuser = async (req, res) => {
  try {
    const token = req.cookies.token;
    const result = await session.destroy({
      where: { user_id: req.user.id },
    });
    res.clearCookie("token");
    res.redirect("/login");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.logoutothersevice = async (req, res) => {
  try {
    const token = req.cookies.token;
    user_id = req.user.id;
    const result = await session.destroy({
      where: {
        [Op.or]: {
          user_id: { [Op.ne]: user_id },
          session_token: { [Op.ne]: token },
        },
      },
    });
    res.clearCookie("token");
    res.redirect("/login");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
