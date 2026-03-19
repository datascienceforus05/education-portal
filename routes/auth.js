const express = require("express");
const router = express.Router();
const { registerStudent, registerFaculty, login, getMe, updateProfile, changePassword, getFacultyList, getBoardList } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/register/student", registerStudent);
router.post("/register/faculty", registerFaculty);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/change-password", protect, changePassword);

router.get("/faculty", getFacultyList);
router.get("/board", getBoardList);

module.exports = router;
