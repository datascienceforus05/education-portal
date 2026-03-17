const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, restrictTo } = require("../middleware/auth");

// Get all students
router.get("/", protect, restrictTo("admin", "faculty"), async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).sort({ createdAt: -1 });
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
