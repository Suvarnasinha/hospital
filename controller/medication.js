const express = require("express");
const app = express();
const Sequelize = require("sequelize");
app.set("view engine", "ejs");
const router = express.Router();
const bodyParser = require("body-parser");
const medication = require('../models/medication');

exports.addMedication = async (req, res) => {
  const { user_id, name, description, type, date, start_date, end_date, time, day_week } = req.body;

  try {
    let newMedication;
    if (type === 'one-time') {
      newMedication = await medication.create({
        user_id,
        name,
        description,
        type,
        date,
        time,
      });
    } else if (type === 'recurring') {
      newMedication = await medication.create({
        user_id,
        name,
        description,
        type,
        start_date,
        end_date,
        time,
        day_week,  // Assume day_week is already a comma-separated string
      });
    } else {
     res.json({ error: 'Invalid medication type' });
    }

    res.json({ message: 'medication added successfully', medication: newMedication });
  } catch (error) {
    res.json({ error: 'Failed to add medication' });
  }
};
