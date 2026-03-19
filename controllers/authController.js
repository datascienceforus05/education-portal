const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// @desc  Register Student
// @route POST /api/auth/register/student
exports.registerStudent = async (req, res) => {
    try {
        const { name, email, password, phone, courseId } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: "All fields required" });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(409).json({ success: false, message: "Email already registered" });

        let enrolledCourses = [];
        const Course = require("../models/Course"); // ensure Course is loaded

        if (courseId) {
            const course = await Course.findById(courseId);
            if (course) {
                enrolledCourses.push(course._id);
            }
        }

        const user = await User.create({ name, email, password, phone, role: "student", isApproved: true, enrolledCourses });

        if (enrolledCourses.length > 0) {
            await Course.findByIdAndUpdate(courseId, { $push: { enrolledStudents: user._id } });
        }

        const token = generateToken(user._id);
        res.status(201).json({ success: true, token, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Register Faculty
// @route POST /api/auth/register/faculty
exports.registerFaculty = async (req, res) => {
    try {
        const { name, email, password, phone, department, qualification, bio } = req.body;
        if (!name || !email || !password || !department)
            return res.status(400).json({ success: false, message: "All fields required" });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(409).json({ success: false, message: "Email already registered" });

        const user = await User.create({
            name, email, password, phone, department, qualification, bio,
            role: "faculty", isApproved: false, // Pending admin approval
        });
        res.status(201).json({
            success: true,
            message: "Registration successful! Awaiting admin approval.",
            user,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Login any user
// @route POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: "Email and password required" });

        const user = await User.findOne({ email }).select("+password");
        if (!user)
            return res.status(401).json({ success: false, message: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(401).json({ success: false, message: "Invalid credentials" });

        if (!user.isActive)
            return res.status(403).json({ success: false, message: "Account is suspended" });

        if (user.role === "faculty" && !user.isApproved)
            return res.status(403).json({ success: false, message: "Faculty account pending admin approval" });

        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);
        res.json({ success: true, token, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("enrolledCourses", "title code");
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Update profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, bio, department, qualification } = req.body;
        const updateData = { name, phone, bio, department, qualification };

        if (email) {
            const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (exists) return res.status(400).json({ success: false, message: "Email already taken" });
            updateData.email = email;
        }

        if (req.file) {
            updateData.avatar = `/uploads/${req.user.role}/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Change password
// @route PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select("+password");
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch)
            return res.status(400).json({ success: false, message: "Current password incorrect" });
        user.password = newPassword;
        await user.save();
        const token = generateToken(user._id);
        res.json({ success: true, message: "Password changed successfully", token });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get all approved faculty (public)
// @route GET /api/auth/faculty
exports.getFacultyList = async (req, res) => {
    try {
        const User = require("../models/User"); // Ensure User model is accessible
        const faculties = await User.find({ role: "faculty", isApproved: true })
            .select("name avatar department bio qualification");
        res.json({ success: true, faculties });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get Board Members (public)
// @route GET /api/auth/board
exports.getBoardList = async (req, res) => {
    try {
        const User = require("../models/User");
        const board = await User.find({ role: "board_member", isActive: true })
            .select("name avatar designation bio");
        res.json({ success: true, board });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
