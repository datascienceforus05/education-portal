const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

// Get all conversations for a user
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user.id })
            .populate("participants", "name email avatar role phone bio department qualification")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });


        res.json({ conversations });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Start or get a conversation
exports.startConversation = async (req, res) => {
    try {
        const { receiverId } = req.body;
        if (!receiverId) return res.status(400).json({ message: "Receiver ID is required" });

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user.id, receiverId]
            });
            await conversation.populate("participants", "name email avatar role phone bio department qualification");

        }

        res.json({ conversation });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await Message.find({ conversation: id })
            .populate("sender", "name avatar")
            .sort({ createdAt: 1 });

        res.json({ messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, content, messageType, receiverId } = req.body;
        const attachments = req.files ? req.files.map(file => {
            const roleDir = req.user ? req.user.role : "general";
            return {
                url: `/uploads/${roleDir}/${file.filename}`,
                name: file.originalname,
                fileType: file.mimetype.split("/")[0],
                size: file.size
            };
        }) : [];


        const message = await Message.create({
            conversation: conversationId,
            sender: req.user.id,
            content,
            messageType: messageType || (attachments.length > 0 ? (attachments[0].fileType === "image" ? "image" : "file") : "text"),
            attachments
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: Date.now()
        });

        const fullMessage = await message.populate("sender", "name avatar");

        // Emit via Socket.io
        const io = req.app.get("io");
        io.to(receiverId).emit("receiveMessage", fullMessage);

        res.json({ message: fullMessage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
