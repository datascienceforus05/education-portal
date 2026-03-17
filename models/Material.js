const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        fileUrl: { type: String },
        fileType: { type: String, enum: ["pdf", "video", "doc", "ppt", "image", "live", "link", "other"] },
        fileSize: { type: Number }, // in bytes
        fileName: { type: String },
        thumbnailUrl: { type: String }, // For video/image thumbs
        liveUrl: { type: String }, // For live classes
        scheduledDate: { type: Date }, // For countdown
        isApproved: { type: Boolean, default: false },
        downloadCount: { type: Number, default: 0 },
        chapter: { type: String },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
