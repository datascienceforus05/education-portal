const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
        phone: { type: String, trim: true },
        avatar: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        isApproved: { type: Boolean, default: false }, // Faculty needs admin approval
        department: { type: String, trim: true },
        enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
        qualification: { type: String }, // For faculty
        bio: { type: String },
        lastLogin: { type: Date },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from responses
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model("User", userSchema);
