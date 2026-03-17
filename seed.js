const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Course = require("./models/Course");
const Material = require("./models/Material");
const Exam = require("./models/Exam");
const Schedule = require("./models/Schedule");

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        await Material.deleteMany({});
        await Exam.deleteMany({});
        await Schedule.deleteMany({});
        console.log("Cleared existing data.");

        // 1. Create Admin
        const admin = await User.create({
            name: "Portal Admin",
            email: "admin@onorg.com",
            password: "Admin@123",
            role: "admin",
            isApproved: true,
            isActive: true
        });
        console.log("Admin created.");

        // 2. Create Faculty
        const faculty1 = await User.create({
            name: "Dr. Robert Smith",
            email: "robert@faculty.com",
            password: "Password@123",
            role: "faculty",
            isApproved: true,
            isActive: true,
            department: "Computer Science",
            qualification: "Ph.D. in AI",
            bio: "Expert in Machine Learning and Data Science with 15 years of experience."
        });

        const faculty2 = await User.create({
            name: "Prof. Sarah Johnson",
            email: "sarah@faculty.com",
            password: "Password@123",
            role: "faculty",
            isApproved: true,
            isActive: true,
            department: "Mathematics",
            qualification: "M.Sc. Mathematics",
            bio: "Passionate about making complex mathematical concepts easy for everyone."
        });
        console.log("Faculty created.");

        // 3. Create Students
        const student1 = await User.create({
            name: "Alice Wang",
            email: "alice@student.com",
            password: "Password@123",
            role: "student",
            isApproved: true,
            isActive: true
        });

        const student2 = await User.create({
            name: "John Doe",
            email: "john@student.com",
            password: "Password@123",
            role: "student",
            isApproved: true,
            isActive: true
        });
        console.log("Students created.");

        // 4. Create Courses
        const course1 = await Course.create({
            title: "Advanced React & Next.js",
            description: "Learn how to build production-scale web applications using modern React patterns and Next.js.",
            code: "CS101",
            category: "Web Development",
            level: "advanced",
            duration: "8 Weeks",
            faculty: faculty1._id,
            isActive: true
        });

        const course2 = await Course.create({
            title: "Linear Algebra for Data Science",
            description: "A comprehensive guide to linear algebra specifically tailored for aspiring data scientists.",
            code: "MA202",
            category: "Mathematics",
            level: "intermediate",
            duration: "6 Weeks",
            faculty: faculty2._id,
            isActive: true
        });
        console.log("Courses created.");

        // 5. Create Schedules
        const now = new Date();
        await Schedule.create({
            title: "Introduction to Server Components",
            description: "Deep dive into RSC and the app router.",
            course: course1._id,
            faculty: faculty1._id,
            scheduledAt: new Date(now.getTime() + 86400000), // Tomorrow
            duration: 90,
            meetingLink: "https://meet.google.com/abc-defg-hij",
            platform: "google_meet",
            status: "upcoming"
        });

        await Schedule.create({
            title: "Vector Spaces and Subspaces",
            description: "Mastering the fundamentals of vectors.",
            course: course2._id,
            faculty: faculty2._id,
            scheduledAt: new Date(now.getTime() + 172800000), // Day after tomorrow
            duration: 60,
            meetingLink: "https://zoom.us/j/123456789",
            platform: "zoom",
            status: "upcoming"
        });
        console.log("Schedules created.");

        // 6. Create Materials
        await Material.create({
            title: "React Hooks Cheat Sheet",
            description: "A quick reference guide for all standard React hooks.",
            course: course1._id,
            uploadedBy: faculty1._id,
            fileUrl: "https://example.com/hooks.pdf",
            fileType: "pdf",
            isApproved: true
        });

        await Material.create({
            title: "Algebra Basics Note",
            description: "Foundational concepts for the linear algebra course.",
            course: course2._id,
            uploadedBy: faculty2._id,
            fileUrl: "https://example.com/algebra.pdf",
            fileType: "pdf",
            isApproved: true
        });
        console.log("Materials created.");

        // 7. Create Exams
        await Exam.create({
            title: "React Fundamentals Quiz",
            description: "Test your knowledge of core React concepts.",
            course: course1._id,
            createdBy: faculty1._id,
            duration: 30,
            isActive: true,
            questions: [
                {
                    questionText: "What hook is used for side effects in React?",
                    options: [
                        { text: "useState", isCorrect: false },
                        { text: "useEffect", isCorrect: true },
                        { text: "useContext", isCorrect: false },
                        { text: "useReducer", isCorrect: false }
                    ],
                    marks: 10
                },
                {
                    questionText: "React is a framework of...",
                    options: [
                        { text: "PHP", isCorrect: false },
                        { text: "JavaScript", isCorrect: true },
                        { text: "Python", isCorrect: false },
                        { text: "Ruby", isCorrect: false }
                    ],
                    marks: 10
                }
            ]
        });
        console.log("Exams created.");

        console.log("Seeding completed successfully! 🚀");
        process.exit();
    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
};

seedData();
