const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getConversations, startConversation, getMessages, sendMessage } = require("../controllers/chatController");
const upload = require("../middleware/upload");

router.get("/conversations", protect, getConversations);
router.post("/conversations", protect, startConversation);
router.get("/messages/:id", protect, getMessages);
router.post("/messages", protect, upload.array("attachments", 10), sendMessage);


module.exports = router;
