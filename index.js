const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Event, JoinedEvent } = require("./models");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000"], // Next.js frontend URL
    credentials: true,
  }),
);
app.use(express.json());

// MongoDB Connection
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

// --- ROUTES ---

// Generate JWT Token (Call this after BetterAuth login in frontend)
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.send({ token });
});

// Create Event (Private)
app.post("/events", verifyToken, async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const result = await newEvent.save();
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get Upcoming Events (Public) - Sorted by Date, Only Future events
app.get("/events", async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({ date: { $gte: currentDate } }).sort({
      date: 1,
    });
    res.send(events);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Recent 6 Upcoming Events for Home Page (Public)
app.get("/events/recent", async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({ date: { $gte: currentDate } })
      .sort({ date: 1 })
      .limit(6);
    res.send(events);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Specific Event Details (Public)
app.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.send(event);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Events created by specific user (Manage Events - Private)
app.get("/my-events/:email", verifyToken, async (req, res) => {
  if (req.user.email !== req.params.email) {
    return res.status(403).send({ message: "Forbidden access" });
  }
  try {
    const events = await Event.find({ creatorEmail: req.params.email });
    res.send(events);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update Event (Private)
app.put("/events/:id", verifyToken, async (req, res) => {
  try {
    const result = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete Event (Private)
app.delete("/events/:id", verifyToken, async (req, res) => {
  try {
    const result = await Event.findByIdAndDelete(req.params.id);
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Join Event (Private)
app.post("/join-event", verifyToken, async (req, res) => {
  try {
    const joinEntry = new JoinedEvent(req.body);
    const result = await joinEntry.save();
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get Joined Events by User Email (Private)
app.get("/joined-events/:email", verifyToken, async (req, res) => {
  if (req.user.email !== req.params.email) {
    return res.status(403).send({ message: "Forbidden access" });
  }
  try {
    // Populating event data
    const joined = await JoinedEvent.find({ userEmail: req.params.email })
      .populate("eventId")
      .sort({ joinedAt: -1 });
    res.send(joined);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Social Events Server is running...");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
