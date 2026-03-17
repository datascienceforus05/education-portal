const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

// Store io in app for access in controllers
app.set("io", io);

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded materials)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/students"));
app.use("/api/faculty", require("./routes/faculty"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/materials", require("./routes/materials"));
app.use("/api/exams", require("./routes/exams"));
app.use("/api/schedules", require("./routes/schedules"));
app.use("/api/results", require("./routes/results"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/chat", require("./routes/chat"));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Shalom Education Portal API Running" });
});

// Socket.io connection
io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected: shalomEducationPortal");
        server.listen(process.env.PORT || 5000, () => {
            console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    });

