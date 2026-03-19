const express = require("express");
const router = express.Router();
const { createCourse, getCourses, getCourse, enrollCourse, updateCourse, getMyCourses, deleteCourse } = require("../controllers/courseController");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/public/all", getCourses); // Public route
router.get("/public/details/:id", getCourse); // Public route for details
router.get("/", protect, getCourses);
router.get("/my-courses", protect, getMyCourses);
router.get("/:id", protect, getCourse);
router.post("/", protect, restrictTo("faculty", "admin"), createCourse);
router.post("/:id/enroll", protect, restrictTo("student"), enrollCourse);
router.put("/:id", protect, restrictTo("faculty", "admin"), updateCourse);
router.delete("/:id", protect, restrictTo("faculty", "admin"), deleteCourse);

module.exports = router;
