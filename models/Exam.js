const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [
        {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, default: false },
        },
    ],
    marks: { type: Number, default: 1 },
    explanation: { type: String },
});

const examSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        questions: [questionSchema],
        totalMarks: { type: Number, default: 0 },
        passingMarks: { type: Number, default: 0 },
        duration: { type: Number, required: true }, // in minutes
        startTime: { type: Date },
        endTime: { type: Date },
        isActive: { type: Boolean, default: false },
        allowedAttempts: { type: Number, default: 1 },
        shuffleQuestions: { type: Boolean, default: false },
        showResult: { type: Boolean, default: true },
        instructions: { type: String },
    },
    { timestamps: true }
);

// Auto-calculate total marks
examSchema.pre("save", function (next) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
    this.passingMarks = Math.ceil(this.totalMarks * 0.4); // 40% passing
    next();
});

module.exports = mongoose.model("Exam", examSchema);
