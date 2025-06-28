import { clerkClient } from '@clerk/express'


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






    } catch (error) {

    }
}