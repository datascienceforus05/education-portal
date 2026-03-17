const express = require("express");
const router = express.Router();
const { createExam, getCourseExams, getExam, submitExam, toggleExam } = require("../controllers/examController");
const { protect, restrictTo } = require("../middleware/auth");

router.post("/", protect, restrictTo("faculty", "admin"), createExam);
router.get("/course/:courseId", protect, getCourseExams);
router.get("/:id", protect, getExam);
router.post("/:id/submit", protect, restrictTo("student"), submitExam);
router.put("/:id/toggle", protect, restrictTo("faculty", "admin"), toggleExam);

module.exports = router;
