import Stripe from "stripe";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";


export const getUserData = async (req, res) => {
    try {

        const userId = req.auth.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });


    } catch (error) {

        res.status(500).json({ success: false, message: error.message });

    }
}

export const userEnrolledCourses = async (req, res) => {

    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId).populate("enrolledCourses");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, enrolledCourses: user.enrolledCourses });



    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}

export const purchaseCourse = async (req, res) => {

    try {
        const { courseId } = req.body;
        const { origin } = req.headers;

        const userId = req.auth.userId;

        const userData = await User.findById(userId);

        const courseData = await Course.findById(courseId);

        if (!userData || !courseData) {
            return res.status(404).json({ success: false, message: "User or course not found" });
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData);

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        const currency = process.env.CURRENCY.toLowerCase();

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle,
                },
                unit_amount: Math.floor(newPurchase.amount) * 100,

            },
            quantity: 1,
        }]

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            mode: "payment",
            metadata: {
                purchaseId: newPurchase._id.toString(),
            }
        })

        res.status(200).json({ success: true, session_url: session.url });



    } catch (error) {
        res.json({ success: false, message: error.message });
    }


}