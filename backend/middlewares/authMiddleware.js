import { clerkClient } from "@clerk/express";

export const protectEducator = async (req, res, next) => {
    try {
        const userId = req.auth.userId;

        const response = await clerkClient.users.getUser(userId);

        if (response.publicMetadata.role !== "educator") {
            return res.status(401).json({ success: false, message: "You are not an educator" });
        }

        next();

    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
    }
}