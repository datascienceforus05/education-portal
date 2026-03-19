const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("./models/Course");
const User = require("./models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mebishnusahu_db_user:bishnu05@cluster0.ld1jlet.mongodb.net/?appName=Cluster0";

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Big Seeding...");

        let faculty = await User.findOne({ role: "faculty" });
        if (!faculty) {
            faculty = await User.create({
                name: "Academic Board",
                email: "board@collegemobi.com",
                password: "Password@123",
                role: "faculty",
                isApproved: true,
                isActive: true,
            });
        }

        const courses = [
            // Engineering
            ...[
                "Aerospace Engineering", "Architecture", "Biological & Biomedical Engineering", "Biology",
                "Biomedical Science", "Chemical Engineering", "Civil Engineering", "Electrical Engineering",
                "Engineering", "Engineering Management", "Environmental Engineering", "Environmental Science",
                "Industrial & Mechanical Engineering", "Mathematics & Statistics"
            ].map(t => ({ title: t, category: "Engineering", level: "intermediate", code: "ENG-" + Math.random().toString(36).substring(7).toUpperCase(), faculty: faculty._id, isActive: true })),

            // Medical
            ...[
                "Bachelor of Medicine, Bachelor of Surgery - MBBS", "MBBS Specialisations", "Master of Surgery - MS",
                "Doctor of Medicine - MD", "Bachelor of Ayurvedic Medicine and Surgery - BAMS",
                "Bachelor of Homeopathic Medicine and Surgery - BHMS", "Bachelor of Physiotherapy - BPT",
                "Bachelor of Veterinary Science - B.VSc", "Bachelor of Unani Medicine and Surgery - BUMS",
                "Bachelor of Siddha Medicine and Surgery - BSMS", "Bachelor of Naturopathy and Yoga- BNYS",
                "Advance Care Paramedic", "Anaesthesia Assistants and Technologist", "Anatomy (Non-clinical)",
                "Assistant Behaviour Analyst", "Behaviour Analyst", "Biochemistry", "Biomedical Engineer",
                "Biotechnologist", "Burn Care Technologist", "Cardiovascular Technologist", "Cell Geneticist",
                "Clinical Coder", "Clinical Social Worker", "Critical Care or ICU Technologist", "Cytogenetics",
                "Cytotechnologist", "Diagnostic Medical Radiographer", "Diagnostic Medical Sonographer",
                "Dialysis Therapy Technologist", "Dietitian", "Ecologist", "ECG or ECHO Technologist",
                "EEG or END or EMG or Neuro Lab Technologist", "Emergency Medical Technologist",
                "Endoscopy and Laparoscopy Technologist", "Environment Protection Officer", "Forensic Science Technologist",
                "Health Educator", "Health Information Management Assistant", "Health Information Management Technologist",
                "Hemato-technologist", "Histo-technologist", "HIV or Family Planning Counsellors",
                "Integrated Behavioural Health Counsellors", "Medical Equipment Technologist", "Medical Laboratory Technologist",
                "Mental Health Support Workers", "Microbiologist (non-clinical)", "Molecular Biologist (non-clinical)",
                "Molecular Geneticist", "Movement Therapist", "Nuclear Medicine Technologist", "Nutritionist",
                "Occupational Health and Safety Officer"
            ].map(t => ({ title: t, category: "Medical", level: "advanced", code: "MED-" + Math.random().toString(36).substring(7).toUpperCase(), faculty: faculty._id, isActive: true })),

            // Law
            ...[
                "Bachelor of Laws (LL.B.)", "Master of Laws (LL.M.)", "Master of Business Law",
                "Doctor of Philosophy (PhD) in Law", "Integrated MBL-LLM/ MBA-LLM", "Law Specialisations"
            ].map(t => ({ title: t, category: "Law", level: "intermediate", code: "LAW-" + Math.random().toString(36).substring(7).toUpperCase(), faculty: faculty._id, isActive: true })),

            // Technology
            ...[
                "Computer Networks", "Bachelor of Computer Applications", "Bachelors of Science - Information Technology",
                "Master of Computer Applications", "Ph.D Computer Applications", "Specialization in Cyber Security",
                "Specialization in Data Science - Data Analytics", "Specialization in Artificial Intelligence",
                "Specialization in Full Stack Development"
            ].map(t => ({ title: t, category: "Technology", level: "intermediate", code: "TECH-" + Math.random().toString(36).substring(7).toUpperCase(), faculty: faculty._id, isActive: true })),

            // Fine Art and Design
            ...[
                "Sculpture", "Printmaking", "Art design", "Drawing and Painting", "Studio arts",
                "Architecture (Arts)", "Digital media", "Fashion Design", "Interior Design",
                "Photography", "Animation", "Graphic Design"
            ].map(t => ({ title: t, category: "Fine Arts", level: "beginner", code: "ART-" + Math.random().toString(36).substring(7).toUpperCase(), faculty: faculty._id, isActive: true })),

            // Social Science
            ...[
                "BA English", "BA Political Science", "BA Economics", "BA History", "BA Library Science",
                "BA Sociology", "BA Geography", "BA Philosophy", "BA Social Work", "MA English",
                "MA Political Science", "MA Economics", "MA History", "MA Library Science", "MA Sociology", "MA Geography"
            ].map(t => ({ title: t, category: "Social Science", level: "beginner", code: "SOC-" + Math.random().toString(36).substring(7).toUpperCase(), faculty: faculty._id, isActive: true }))
        ];

        console.log(`Starting seeding for ${courses.length} courses...`);

        for (const c of courses) {
            await Course.updateOne(
                { title: c.title, category: c.category },
                { $set: c },
                { upsert: true }
            );
        }

        console.log("Big Seeding completed. 🚀");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
