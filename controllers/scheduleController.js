const Schedule = require("../models/Schedule");

// @desc  Create schedule
// @route POST /api/schedules
exports.createSchedule = async (req, res) => {
    try {
        const { title, description, course, scheduledAt, duration, meetingLink, meetingId, meetingPassword, platform, notes } = req.body;
        const schedule = await Schedule.create({
            title, description, course, scheduledAt, duration,
            meetingLink, meetingId, meetingPassword, platform, notes,
            faculty: req.user.id,
        });
        await schedule.populate([{ path: "course", select: "title code" }, { path: "faculty", select: "name avatar" }]);
        res.status(201).json({ success: true, schedule });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get schedules for a course
// @route GET /api/schedules/course/:courseId
exports.getCourseSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find({ course: req.params.courseId })
            .populate("faculty", "name avatar")
            .sort({ scheduledAt: 1 });
        res.json({ success: true, schedules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get upcoming schedules (for student/faculty dashboard)
// @route GET /api/schedules/upcoming
exports.getUpcomingSchedules = async (req, res) => {
    try {
        const filter = {
            scheduledAt: { $gte: new Date() },
            status: { $in: ["upcoming", "live"] },
        };
        if (req.user.role === "faculty") filter.faculty = req.user.id;

        const schedules = await Schedule.find(filter)
            .populate("course", "title code")
            .populate("faculty", "name avatar")
            .sort({ scheduledAt: 1 })
            .limit(10);
        res.json({ success: true, schedules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Update schedule status
// @route PUT /api/schedules/:id/status
exports.updateScheduleStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("course", "title").populate("faculty", "name");
        if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });
        res.json({ success: true, schedule });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Delete schedule
// @route DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Schedule deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
