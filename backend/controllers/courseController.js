import Course from "../models/Course.js";

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).select(["-courseContent", "-enrolledStudents"]).populate({
            path: "educator",
            model: "User",
            localField: "educator",
            foreignField: "__id",
            justOne: true
        });

        if (courses.length === 0) return res.status(200).json({ success: true, message: "No courses found", courses: [] });

        res.status(200).json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getCourseId = async (req, res) => {
    try {
        const { id } = req.params;

        const courseData = await Course.findById(id).populate({
            path: "educator",
            model: "User",
            localField: "educator",
            foreignField: "__id",
            justOne: true

        });
        if (!courseData) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        courseData.courseContent.forEach((chapter) => {
            chapter.chapterContent.forEach((lecture) => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            })
        });

        res.status(200).json({ success: true, courseData });


    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
