import { clerkClient } from '@clerk/express'
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';


export const updateRoleEducator = async (req, res) => {
    try {
        const userId = req.auth.userId;//auth deprecated by clerk if not work then use auth().userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: "educator"
            }
        });

        res.status(200).json({ success: true, message: "You can now publish courses" });

    } catch (error) {

        res.status(500).json({ success: false, message: error.message });

    }
}

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Thumbnail is required" });
        }

        const parsedCourseData = await JSON.parse(courseData);

        parsedCourseData.educator = educatorId;

        const newCourse = await Course.create(parsedCourseData);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        newCourse.thumbnail = imageUpload.secure_url;

        await newCourse.save();

        res.status(200).json({ success: true, message: "Course added successfully" });

    } catch (error) {

        res.status(500).json({ success: false, message: error.message });

    }
}


export const getEducatorCourses = async (req, res) => {
    try {
        const educatorId = req.auth.userId;

        const educatorCourses = await Course.find({ educator: educatorId });

        if (educatorCourses.length === 0) return res.status(200).json({ success: true, message: "No courses found", courses: [] });

        res.status(200).json({ success: true, courses: educatorCourses });

    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
    }
}

export const educatorDashboardData = async (req, res) => {

    try {
        const educatorId = req.auth.userId;

        const educatorCourses = await Course.find({ educator: educatorId });

        const totalCourses = educatorCourses.length;

        const courseIds = educatorCourses.map((course) => course._id);

        const purchases = await Purchase.find({ courseId: { $in: courseIds }, status: "completed" });

        const totalEarnings = purchases.reduce((acc, purchase) => acc + purchase.amount, 0);

        if (totalCourses === 0) return res.status(200).json({ success: true, totalCourses, totalEarnings, message: "No courses found" });

        const enrolledStudentsData = [];

        for (let course of educatorCourses) {
            const enrolledStudents = await User.find({ _id: { $in: course.enrolledStudents } }, 'name imageUrl');

            enrolledStudents.forEach((student) => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            })

        }

        if (enrolledStudentsData.length === 0) return res.status(200).json({ success: true, dashboardData: { totalCourses, totalEarnings, enrolledStudentsData }, message: "No enrolled students found" });

        res.status(200).json({
            success: true, dashboardData: {
                totalCourses,
                totalEarnings,
                enrolledStudentsData
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }

}

export const getEnrolledStudentsData = async (req, res) => {

    try {
        const educatorId = req.auth.userId;

        const educatorCourses = await Course.find({ educator: educatorId });

        const courseIds = educatorCourses.map((course) => course._id);

        const purchases = await Purchase.find({ courseId: { $in: courseIds }, status: "completed" }).populate("userId", "name imageUrl").populate("courseId", "courseTitle");

        const enrolledStudents = purchases.map((purchase) => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.status(200).json({ success: true, enrolledStudents });

    } catch (error) {

        res.status(500).json({ success: false, message: error.message });

    }


}

