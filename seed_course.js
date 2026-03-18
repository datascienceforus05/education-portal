const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("./models/Course");
const User = require("./models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mebishnusahu_db_user:bishnu05@cluster0.ld1jlet.mongodb.net/?appName=Cluster0";

const seedCourses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Course Seeding...");

        // Ensure we have a faculty member to own the courses
        let faculty = await User.findOne({ role: "faculty" });
        if (!faculty) {
            faculty = await User.create({
                name: "Dr. Default Faculty",
                email: "faculty_seed@collegemobi.com",
                password: "Password@123",
                role: "faculty",
                isApproved: true,
                isActive: true,
                department: "General",
            });
            console.log("Created a default faculty member.");
        }

        const coursesToSeed = [
            {
                title: "Advanced IT Infrastructure",
                description: "Learn cloud computing, server management, and modern networking practices in a hands-on learning environment.",
                code: "IT901",
                category: "IT",
                level: "advanced",
                duration: "12 Weeks",
                price: 199,
                isActive: true,
                faculty: faculty._id,
                thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
            },
            {
                title: "Fundamentals of Nursing Care",
                description: "A comprehensive introductory course on healthcare principles, patient management, and essential nursing duties.",
                code: "NUR101",
                category: "Nursing",
                level: "beginner",
                duration: "8 Weeks",
                price: 150,
                isActive: true,
                faculty: faculty._id,
                thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
            },
            {
                title: "Mechanical Engineering Dynamics",
                description: "Deep dive into classical mechanics, motion analysis, and physical systems for aspiring engineers.",
                code: "ENG305",
                category: "Engineering",
                level: "intermediate",
                duration: "10 Weeks",
                price: 250,
                isActive: true,
                faculty: faculty._id,
                thumbnail: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800"
            },
            {
                title: "Corporate Law and Ethics",
                description: "Study the legal landscape of modern businesses, corporate governance, and ethical compliance.",
                code: "LAW202",
                category: "Law",
                level: "intermediate",
                duration: "6 Weeks",
                price: 120,
                isActive: true,
                faculty: faculty._id,
                thumbnail: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800"
            },
            {
                title: "Medical Anatomy & Physiology",
                description: "A profound exploration into the structure and function of the human body for pre-med students.",
                code: "MED401",
                category: "Medical",
                level: "advanced",
                duration: "14 Weeks",
                price: 300,
                isActive: true,
                faculty: faculty._id,
                thumbnail: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
            },
            {
                title: "Full Stack Web Development",
                description: "Become a proficient web developer by mastering both frontend and backend technologies.",
                code: "IT902",
                category: "IT",
                level: "intermediate",
                duration: "16 Weeks",
                price: 299,
                isActive: true,
                faculty: faculty._id,
                thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800"
            }
        ];

        let count = 0;
        for (const c of coursesToSeed) {
            const exists = await Course.findOne({ code: c.code });
            if (!exists) {
                await Course.create(c);
                count++;
            }
        }

        console.log(`Seeding completed. ${count} new courses added. 🚀`);
        process.exit(0);
    } catch (err) {
        console.error("Error seeding courses:", err);
        process.exit(1);
    }
};

seedCourses();
