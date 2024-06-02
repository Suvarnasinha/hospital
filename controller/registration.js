const express = require("express");
const app = express();
const Sequelize = require("sequelize");
app.set("view engine", "ejs");
const router = express.Router();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const { secretKey,loggedOutTokens } = require('../middleware/authenticate');
const {user,session}=require('../models')


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

exports.registration = async (req, res) => {
  const { username,email, password } = req.body;

  try {
   const register=await user.create({
    username,
    email,
    password,
   });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'User registration failed' });
  }
};


exports.login=async(req,res)=>{
  try {
    const { email, password } = req.body;
    const loginverify = await user.findOne({ where: { email } });

    if (!loginverify) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: loginverify.id }, secretKey, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

exports.logout=async(req,res)=>{
  try {
    const token = req.cookies.token;

    if (token) {
      // Add token to logged out tokens array
      loggedOutTokens.push(token);
      res.clearCookie('token');
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


exports.logoutalltheuser=async(req,res)=>{
  try {
    const token = req.cookies.token;

    if (token) {
      // Invalidate all tokens for the user
      tokenStore = tokenStore.concat(req.cookies.token);
      res.clearCookie('token');
    }

    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}