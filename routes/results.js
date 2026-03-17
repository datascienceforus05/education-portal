const express = require("express");
const router = express.Router();
const { getMyResults, getExamResults, getResult } = require("../controllers/resultController");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/my-results", protect, restrictTo("student"), getMyResults);
router.get("/exam/:examId", protect, restrictTo("faculty", "admin"), getExamResults);
router.get("/:id", protect, getResult);

module.exports = router;
