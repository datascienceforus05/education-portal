const Material = require("../models/Material");
const Course = require("../models/Course");
const path = require("path");

const getFileType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    if ([".pdf"].includes(ext)) return "pdf";
    if ([".mp4", ".mkv", ".avi", ".mov"].includes(ext)) return "video";
    if ([".doc", ".docx"].includes(ext)) return "doc";
    if ([".ppt", ".pptx"].includes(ext)) return "ppt";
    if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) return "image";
    return "other";
};

// @desc  Upload material
// @route POST /api/materials/upload
exports.uploadMaterial = async (req, res) => {
    try {
        const { title, description, course, chapter, order, isLive, liveUrl, scheduledDate } = req.body;

        let fileUrl, fileType, fileName, fileSize, thumbnailUrl;

        if (isLive === "true" || isLive === true) {
            fileType = "live";
            fileUrl = liveUrl;
        } else {
            const uploadedFile = req.files?.file?.[0];
            if (!uploadedFile && !liveUrl)
                return res.status(400).json({ success: false, message: "No file or live URL provided" });

            if (uploadedFile) {
                fileUrl = `/uploads/${req.user.role}/${uploadedFile.filename}`;
                fileName = uploadedFile.originalname;
                fileType = getFileType(uploadedFile.originalname);
                fileSize = uploadedFile.size;
            } else {
                fileType = "link";
                fileUrl = liveUrl;
            }
        }

        const uploadedThumbnail = req.files?.thumbnail?.[0];
        if (uploadedThumbnail) {
            thumbnailUrl = `/uploads/${req.user.role}/${uploadedThumbnail.filename}`;
        }

        const material = await Material.create({
            title, description, course, chapter, order,
            uploadedBy: req.user.id,
            fileUrl,
            fileName,
            fileType,
            fileSize,
            thumbnailUrl,
            liveUrl,
            scheduledDate,
            isApproved: req.user.role === "admin",
        });

        // Update course material count
        await Course.findByIdAndUpdate(course, { $inc: { totalMaterials: 1 } });

        await material.populate("uploadedBy", "name role");
        res.status(201).json({ success: true, material });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get materials for a course
// @route GET /api/materials/course/:courseId
exports.getCourseMaterials = async (req, res) => {
    try {
        const filter = { course: req.params.courseId };
        if (req.user.role === "student") filter.isApproved = true;

        const materials = await Material.find(filter)
            .populate("uploadedBy", "name role")
            .sort({ order: 1, createdAt: -1 });
        res.json({ success: true, materials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const { createNotification } = require("./notificationController");

// @desc  Approve material (admin)
// @route PUT /api/materials/:id/approve
exports.approveMaterial = async (req, res) => {
    try {
        const material = await Material.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        if (!material) return res.status(404).json({ success: false, message: "Material not found" });

        // Notify faculty
        await createNotification(
            material.uploadedBy,
            "Material Approved! ✅",
            `Your material "${material.title}" has been approved by admin.`,
            "success",
            "/faculty/materials"
        );

        res.json({ success: true, message: "Material approved", material });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Delete material
// @route DELETE /api/materials/:id
exports.deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: "Material not found" });

        if (material.uploadedBy.toString() !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Not authorized" });

        await Material.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Material deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Update material
// @route PUT /api/materials/:id
exports.updateMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: "Material not found" });

        if (material.uploadedBy.toString() !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Not authorized" });

        const { title, description, chapter, order, isLive, liveUrl, scheduledDate } = req.body;

        let updateData = { title, description, chapter, order, liveUrl, scheduledDate };

        if (isLive === "true" || isLive === true) {
            updateData.fileType = "live";
            updateData.fileUrl = liveUrl;
        } else {
            const uploadedFile = req.files?.file?.[0];
            if (uploadedFile) {
                updateData.fileUrl = `/uploads/${req.user.role}/${uploadedFile.filename}`;
                updateData.fileName = uploadedFile.originalname;
                updateData.fileType = getFileType(uploadedFile.originalname);
                updateData.fileSize = uploadedFile.size;
            }
        }

        const uploadedThumbnail = req.files?.thumbnail?.[0];
        if (uploadedThumbnail) {
            updateData.thumbnailUrl = `/uploads/${req.user.role}/${uploadedThumbnail.filename}`;
        }

        const updatedMaterial = await Material.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate("uploadedBy", "name role");

        res.json({ success: true, material: updatedMaterial });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Get all pending materials (admin)
// @route GET /api/materials/pending
exports.getPendingMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ isApproved: false })
            .populate("uploadedBy", "name email")
            .populate("course", "title code");
        res.json({ success: true, materials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
