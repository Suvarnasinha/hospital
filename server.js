const express = require("express");
const app = express();
const sequelize = require("./utils/database");
const bodyParser = require("body-parser");

// Import route file
const dataRoutes = require("./router/router");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Mount route file
app.use("/", dataRoutes);

sequelize.sync({ force: false });
app.listen(process.env.PORT || 3023, () => {
  console.log("Running at Port 3023");
});