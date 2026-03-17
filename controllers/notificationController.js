const Notification = require("../models/Notification");

// @desc  Get user notifications
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort("-createdAt")
            .limit(20);
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Mark notification as read
// @route PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, notification });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Mark all notifications as read
// @route PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
        res.json({ success: true, message: "All marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Helper to create notifications
exports.createNotification = async (userId, title, message, type = "info", link = "", io = null) => {
    try {
        const notification = await Notification.create({ user: userId, title, message, type, link });
        
        // If socket.io is provided, emit notification to user room
        if (io) {
            io.to(userId.toString()).emit("newNotification", notification);
        }
    } catch (err) {
        console.error("Error creating notification:", err);
    }
};

