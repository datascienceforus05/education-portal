const express = require("express");
const router = express.Router();
const { uploadMaterial, getCourseMaterials, approveMaterial, deleteMaterial, getPendingMaterials, updateMaterial } = require("../controllers/materialController");
const { protect, restrictTo } = require("../middleware/auth");
const upload = require("../middleware/upload");

const uploadFields = upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]);

router.post("/upload", protect, restrictTo("faculty", "admin"), uploadFields, uploadMaterial);
router.get("/pending", protect, restrictTo("admin"), getPendingMaterials);
router.get("/course/:courseId", protect, getCourseMaterials);
router.put("/:id/approve", protect, restrictTo("admin"), approveMaterial);
router.put("/:id", protect, restrictTo("faculty", "admin"), uploadFields, updateMaterial);
router.delete("/:id", protect, restrictTo("faculty", "admin"), deleteMaterial);

module.exports = router;
