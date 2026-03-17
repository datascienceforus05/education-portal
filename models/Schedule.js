const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        scheduledAt: { type: Date, required: true },
        duration: { type: Number, required: true }, // in minutes
        meetingLink: { type: String }, // Google Meet / Zoom link
        meetingId: { type: String },
        meetingPassword: { type: String },
        platform: { type: String, enum: ["zoom", "google_meet", "teams", "other"], default: "google_meet" },
        status: { type: String, enum: ["upcoming", "live", "completed", "cancelled"], default: "upcoming" },
        recordingUrl: { type: String },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        notes: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
