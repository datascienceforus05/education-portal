const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, restrictTo } = require("../middleware/auth");

// Get all approved faculty
router.get("/", protect, async (req, res) => {
    try {
        const faculty = await User.find({ role: "faculty", isApproved: true }).sort({ createdAt: -1 });
        res.json({ success: true, faculty });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
