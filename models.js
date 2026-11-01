const mongoose = require("mongoose");

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true }, // Cleanup, Plantation, Donation, etc.
  thumbnail: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true }, // Must be future date (validated in frontend/backend)
  creatorEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Joined Event Schema (To track who joined which event)
const joinedEventSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  userEmail: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", eventSchema);
const JoinedEvent = mongoose.model("JoinedEvent", joinedEventSchema);

module.exports = { Event, JoinedEvent };
