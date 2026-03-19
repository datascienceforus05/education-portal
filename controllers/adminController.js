const User = require("../models/User");
const Course = require("../models/Course");
const Material = require("../models/Material");
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const Schedule = require("../models/Schedule");

// @desc  Dashboard stats
// @route GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const [students, faculty, courses, materials, exams, schedules, results] = await Promise.all([
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "faculty" }),
            Course.countDocuments({ isActive: true }),
            Material.countDocuments(),
            Exam.countDocuments(),
            Schedule.countDocuments({ status: "upcoming" }),
            Result.countDocuments(),
        ]);
        res.json({ success: true, stats: { students, faculty, courses, materials, exams, schedules, results } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get all users
// @route GET /api/admin/users
exports.getUsers = async (req, res) => {
    try {
        const { role, isApproved } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (isApproved !== undefined) filter.isApproved = isApproved === "true";
        const users = await User.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Approve/Reject faculty
// @route PUT /api/admin/users/:id/approve
exports.approveUser = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({
            success: true,
            message: `Faculty ${isApproved ? "approved" : "rejected"}`,
            user,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Toggle user active status
// @route PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, message: `User ${user.isActive ? "activated" : "suspended"}`, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Delete user
// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get all courses (admin)
// @route GET /api/admin/courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate("faculty", "name email")
            .sort({ createdAt: -1 });
        res.json({ success: true, courses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get leaderboard/performance data
// @route GET /api/admin/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        // 1. Faculty Leaderboard (By Enrollments and Student Performance)
        const facultyLeaderboard = await Course.aggregate([
            {
                $group: {
                    _id: "$faculty",
                    totalEnrollments: { $sum: { $size: { $ifNull: ["$enrolledStudents", []] } } },

                    courseCount: { $sum: 1 },
                    courseIds: { $push: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "facultyInfo"
                }
            },
            { $unwind: "$facultyInfo" },
            {
                $project: {
                    name: "$facultyInfo.name",
                    email: "$facultyInfo.email",
                    avatar: "$facultyInfo.avatar",
                    department: "$facultyInfo.department",
                    totalEnrollments: 1,
                    courseCount: 1
                }
            },
            { $sort: { totalEnrollments: -1 } }
        ]);

        // 2. Student Leaderboard (Overall Top Marks)
        const studentLeaderboard = await Result.aggregate([
            {
                $group: {
                    _id: "$student",
                    avgPercentage: { $avg: "$percentage" },
                    totalExams: { $sum: 1 },
                    examsPassed: { $sum: { $cond: ["$isPassed", 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            { $unwind: "$studentInfo" },
            {
                $project: {
                    name: "$studentInfo.name",
                    email: "$studentInfo.email",
                    avatar: "$studentInfo.avatar",
                    avgPercentage: { $round: ["$avgPercentage", 1] },
                    totalExams: 1,
                    examsPassed: 1
                }
            },
            { $sort: { avgPercentage: -1 } },
            { $limit: 10 }
        ]);

        console.log("Faculty Leaderboard Data:", JSON.stringify(facultyLeaderboard, null, 2));
        console.log("Student Leaderboard Data:", JSON.stringify(studentLeaderboard, null, 2));

        res.json({ success: true, facultyLeaderboard, studentLeaderboard });
    } catch (err) {
        console.error("Leaderboard Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.seedAdmin = async (req, res) => {

    try {
        const adminExists = await User.findOne({ role: "admin" });
        if (adminExists) return res.status(400).json({ success: false, message: "Admin already exists" });
        const admin = await User.create({
            name: "Super Admin",
            email: "admin@collegemobi.com",
            password: "Admin@123",
            role: "admin",
            isApproved: true,
            isActive: true,
        });
        res.status(201).json({ success: true, message: "Admin created", admin });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, designation, bio, department } = req.body;
        const User = require("../models/User");
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: "User already exists" });

        const user = await User.create({
            name, email, password, role, designation, bio, department,
            isApproved: true,
            isActive: true
        });
        res.status(201).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const User = require("../models/User");
        if (req.body.password) {
            const bcrypt = require("bcryptjs");
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        } else {
            delete req.body.password; // Do not overwrite if no password given
        }
        
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
