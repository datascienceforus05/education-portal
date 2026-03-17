const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String }, // Text content
        attachments: [
            {
                url: { type: String },
                name: { type: String },
                fileType: { type: String }, // image, doc, pdf, audio, etc.
                size: { type: Number },
            }
        ],
        messageType: {
            type: String,
            enum: ["text", "image", "file", "voice"],
            default: "text"
        },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
