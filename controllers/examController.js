const Exam = require("../models/Exam");
const Result = require("../models/Result");
const Course = require("../models/Course");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// @desc  Create exam
// @route POST /api/exams
exports.createExam = async (req, res) => {
    try {
        const { title, description, course: courseId, questions, duration, startTime, endTime, instructions, shuffleQuestions } = req.body;
        const exam = await Exam.create({
            title, description, course: courseId, questions, duration,
            startTime, endTime, instructions, shuffleQuestions,
            createdBy: req.user.id,
        });
        const course = await Course.findByIdAndUpdate(courseId, { $inc: { totalExams: 1 } });
        
        // Notify all students enrolled in this course
        const students = await User.find({ enrolledCourses: courseId, role: "student" });
        await Promise.all(students.map(student => 
            createNotification(
                student._id,
                "New Exam Scheduled! 📝",
                `A new exam "${title}" has been added to ${course.title}.`,
                "info",
                "/student/exams"
            )
        ));

        res.status(201).json({ success: true, exam });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get exams for a course
// @route GET /api/exams/course/:courseId
exports.getCourseExams = async (req, res) => {
    try {
        const exams = await Exam.find({ course: req.params.courseId, isActive: true })
            .populate("createdBy", "name")
            .select(req.user.role === "student" ? "-questions.options.isCorrect -questions.explanation" : "");
        res.json({ success: true, exams });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get single exam (for taking)
// @route GET /api/exams/:id
exports.getExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate("course", "title").populate("createdBy", "name");
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

        // Remove correct answers for students
        if (req.user.role === "student") {
            const sanitized = exam.toObject();
            sanitized.questions = sanitized.questions.map((q) => ({
                ...q,
                options: q.options.map((o) => ({ text: o.text, _id: o._id })),
                explanation: undefined,
            }));
            return res.json({ success: true, exam: sanitized });
        }
        res.json({ success: true, exam });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Submit exam
// @route POST /api/exams/:id/submit
exports.submitExam = async (req, res) => {
    try {
        const { answers, timeTaken } = req.body;
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

        // Check if already attempted
        const existingResult = await Result.findOne({ student: req.user.id, exam: exam._id });
        if (existingResult && existingResult.attemptNumber >= exam.allowedAttempts) {
            return res.status(400).json({ success: false, message: "Maximum attempts reached" });
        }

        // Grade the exam
        let obtainedMarks = 0;
        const gradedAnswers = answers.map((ans) => {
            const question = exam.questions.id(ans.questionId);
            if (!question) return { ...ans, isCorrect: false, marksObtained: 0 };
            const correctOption = question.options.findIndex((o) => o.isCorrect);
            const isCorrect = correctOption === ans.selectedOption;
            const marksObtained = isCorrect ? question.marks : 0;
            obtainedMarks += marksObtained;
            return { questionId: ans.questionId, selectedOption: ans.selectedOption, isCorrect, marksObtained };
        });

        const percentage = Math.round((obtainedMarks / exam.totalMarks) * 100);
        const isPassed = obtainedMarks >= exam.passingMarks;

        const result = await Result.create({
            student: req.user.id,
            exam: exam._id,
            course: exam.course,
            answers: gradedAnswers,
            totalMarks: exam.totalMarks,
            obtainedMarks,
            percentage,
            isPassed,
            timeTaken,
            attemptNumber: existingResult ? existingResult.attemptNumber + 1 : 1,
        });

        await result.populate([{ path: "exam", select: "title" }, { path: "course", select: "title" }]);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Activate/Deactivate exam
// @route PUT /api/exams/:id/toggle
exports.toggleExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
        exam.isActive = !exam.isActive;
        await exam.save();
        res.json({ success: true, exam, message: `Exam ${exam.isActive ? "activated" : "deactivated"}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
