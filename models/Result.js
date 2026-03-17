const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        answers: [
            {
                questionId: mongoose.Schema.Types.ObjectId,
                selectedOption: Number,
                isCorrect: Boolean,
                marksObtained: Number,
            },
        ],
        totalMarks: { type: Number, default: 0 },
        obtainedMarks: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        isPassed: { type: Boolean, default: false },
        timeTaken: { type: Number }, // in seconds
        submittedAt: { type: Date, default: Date.now },
        attemptNumber: { type: Number, default: 1 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
