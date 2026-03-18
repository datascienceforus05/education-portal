const mongoose = require("mongoose");
const Course = require("./models/Course");
const Result = require("./models/Result");
const User = require("./models/User");

async function checkData() {
    try {
        await mongoose.connect("mongodb+srv://mebishnusahu_db_user:bishnu05@cluster0.ld1jlet.mongodb.net/?appName=Cluster0"); // Assuming local mongo

        console.log("Connected to DB");

        const courses = await Course.find().limit(5);
        console.log("Courses count:", await Course.countDocuments());
        console.log("Course sample:", JSON.stringify(courses, null, 2));

        const results = await Result.find().limit(5);
        console.log("Results count:", await Result.countDocuments());
        console.log("Result sample:", JSON.stringify(results, null, 2));

        const faculty = await User.find({ role: "faculty" }).limit(5);
        console.log("Faculty count:", await User.countDocuments({ role: "faculty" }));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
