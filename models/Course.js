const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        code: { type: String, required: true, unique: true, uppercase: true },
        faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        thumbnail: { type: String, default: "" },
        category: { type: String, required: true },
        level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
        duration: { type: String }, // e.g. "3 months"
        price: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        tags: [{ type: String }],
        totalMaterials: { type: Number, default: 0 },
        totalExams: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
