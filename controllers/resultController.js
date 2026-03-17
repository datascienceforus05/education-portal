const Result = require("../models/Result");

// @desc  Get student's results
// @route GET /api/results/my-results
exports.getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user.id })
            .populate("exam", "title duration")
            .populate("course", "title code")
            .sort({ createdAt: -1 });
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get results for an exam (faculty/admin)
// @route GET /api/results/exam/:examId
exports.getExamResults = async (req, res) => {
    try {
        const results = await Result.find({ exam: req.params.examId })
            .populate("student", "name email avatar")
            .sort({ obtainedMarks: -1 });

        const stats = {
            total: results.length,
            passed: results.filter((r) => r.isPassed).length,
            failed: results.filter((r) => !r.isPassed).length,
            avgPercentage:
                results.length > 0
                    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
                    : 0,
            highest: results.length > 0 ? results[0].percentage : 0,
        };
        res.json({ success: true, results, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get single result details
// @route GET /api/results/:id
exports.getResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate("student", "name email avatar")
            .populate({ path: "exam", populate: { path: "questions" } })
            .populate("course", "title code");
        if (!result) return res.status(404).json({ success: false, message: "Result not found" });
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
