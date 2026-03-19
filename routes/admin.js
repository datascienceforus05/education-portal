const express = require("express");
const router = express.Router();
const { getStats, getUsers, approveUser, toggleUserStatus, deleteUser, getAllCourses, seedAdmin, getLeaderboard, createUser, updateUser } = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");

router.post("/seed", seedAdmin); // One-time setup
router.use(protect, restrictTo("admin")); // All below require admin

router.get("/stats", getStats);
router.get("/users", getUsers);
router.put("/users/:id/approve", approveUser);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/courses", getAllCourses);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.get("/leaderboard", getLeaderboard);


module.exports = router;
