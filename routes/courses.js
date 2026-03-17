const express = require("express");
const router = express.Router();
const { createCourse, getCourses, getCourse, enrollCourse, updateCourse, getMyCourses } = require("../controllers/courseController");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/", protect, getCourses);
router.get("/my-courses", protect, getMyCourses);
router.get("/:id", protect, getCourse);
router.post("/", protect, restrictTo("faculty", "admin"), createCourse);
router.post("/:id/enroll", protect, restrictTo("student"), enrollCourse);
router.put("/:id", protect, restrictTo("faculty", "admin"), updateCourse);

module.exports = router;
