const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Event, JoinedEvent } = require("./models");

const app = express();
const port = process.env.PORT || 5000;




mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log(err));

// JWT Middleware for Protected Routes
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Unauthorized access" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Unauthorized access" });
    req.user = decoded;
    next();
  });
};



app.get("/", (req, res) => {
  res.send("Social Events Server is running...");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});