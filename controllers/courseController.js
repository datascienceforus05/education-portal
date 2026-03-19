const Course = require("../models/Course");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// @desc  Create course
// @route POST /api/courses
exports.createCourse = async (req, res) => {
    try {
        const { title, description, code, category, level, duration, price, tags, faculty: facultyId } = req.body;
        
        // Use specified faculty if admin, otherwise use logged-in user (faculty)
        const finalFaculty = (req.user.role === "admin" && facultyId) ? facultyId : req.user.id;

        const course = await Course.create({
            title, description, code, category, level, duration, price, tags,
            faculty: finalFaculty,
        });

        // Notify all students about the new course
        const students = await User.find({ role: "student" });
        const io = req.app.get("io");
        
        // Emit global event for real-time update in UI (optional but good for 'Live' feel)
        io.emit("courseLaunched", { 
            title: "New Course Launched! 🚀", 
            message: `${title} is now available in ${category}.`,
            courseId: course._id 
        });

        for (const student of students) {
            await createNotification(
                student._id,
                "New Course Launched! 🚀",
                `${title} is now available. Check it out now!`,
                "success",
                `/student/courses/${course._id}`,
                io
            );
        }

        res.status(201).json({ success: true, course });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// @desc  Get all courses
// @route GET /api/courses
exports.getCourses = async (req, res) => {
    try {
        const { category, level, search } = req.query;
        const filter = { isActive: true };
        if (category) filter.category = category;
        if (level) filter.level = level;
        if (search) filter.title = { $regex: search, $options: "i" };

        const courses = await Course.find(filter)
            .populate("faculty", "name avatar department")
            .sort({ createdAt: -1 });
        res.json({ success: true, count: courses.length, courses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get single course
// @route GET /api/courses/:id
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("faculty", "name avatar department bio qualification")
            .populate("enrolledStudents", "name avatar email phone createdAt isActive");
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });
        res.json({ success: true, course });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Enroll student in course
// @route POST /api/courses/:id/enroll
exports.enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        const alreadyEnrolled = course.enrolledStudents.includes(req.user.id);
        if (alreadyEnrolled)
            return res.status(400).json({ success: false, message: "Already enrolled" });

        course.enrolledStudents.push(req.user.id);
        await course.save();
        await User.findByIdAndUpdate(req.user.id, { $push: { enrolledCourses: course._id } });
        res.json({ success: true, message: "Enrolled successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Update course
// @route PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });
        if (course.faculty.toString() !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Not authorized" });

        const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, course: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get faculty's courses
// @route GET /api/courses/my-courses
exports.getMyCourses = async (req, res) => {
    try {
        const query =
            req.user.role === "faculty"
                ? { faculty: req.user.id }
                : { enrolledStudents: req.user.id };
        const courses = await Course.find(query)
            .populate("faculty", "name avatar")
            .populate("enrolledStudents", "name email phone avatar isActive createdAt");
        res.json({ success: true, courses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
