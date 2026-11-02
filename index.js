const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Event, JoinedEvent } = require("./models");

const app = express();
const port = process.env.PORT || 5000;








app.get("/", (req, res) => {
  res.send("Social Events Server is running...");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});