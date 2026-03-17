const express = require("express");
const router = express.Router();
const { createSchedule, getCourseSchedules, getUpcomingSchedules, updateScheduleStatus, deleteSchedule } = require("../controllers/scheduleController");
const { protect, restrictTo } = require("../middleware/auth");

router.post("/", protect, restrictTo("faculty", "admin"), createSchedule);
router.get("/upcoming", protect, getUpcomingSchedules);
router.get("/course/:courseId", protect, getCourseSchedules);
router.put("/:id/status", protect, restrictTo("faculty", "admin"), updateScheduleStatus);
router.delete("/:id", protect, restrictTo("faculty", "admin"), deleteSchedule);

module.exports = router;
