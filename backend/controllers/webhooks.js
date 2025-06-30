import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";

export const clerkWebhooks = async (req, res) => {

    try {
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        const payload = req.rawBody.toString("utf8");

        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const event = wh.verify(payload, headers); // 🚀 uses raw verified payload

        const { type, data } = event;

        if (!data?.id) {
            console.error("❌ Missing Clerk user ID:", data);
            return res.status(400).json({ success: false, message: "Missing user ID" });
        }

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    imageUrl: data.image_url || "",
                };
               try {
        const existingUser = await User.findById(userData._id);

        if (!existingUser) {
            await User.create(userData);
            console.log("✅ User created in DB");
        } else {
            console.log("ℹ️ User already exists, skipping creation.");
        }

        res.json({ success: true });
    } catch (err) {
        console.error("❌ DB insert error:", err.message);
        res.json({ success: false, message: err.message });
    }

    break;

            }
            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData);
                res.json({})
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                res.json({})
                break;
            }

            default:
                console.log("⚠️ Unhandled webhook type:", type);
                break;
        }
    } catch (error) {

        console.error("❌ Clerk webhook error:", error.message);

        res.json({
            success: false,
            message: error.message
        })

    }


}

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            })
            const { purchaseId } = session.data[0].metadata;

            const purchaseData = await Purchase.findById(purchaseId);

            const userData = await User.findById(purchaseData.userId);

            const courseData = await Course.findById(purchaseData.courseId.toString());

            courseData.enrolledStudents.push(userData);

            await courseData.save();

            userData.enrolledCourses.push(courseData._id);

            await userData.save();

            purchaseData.status = "completed";

            await purchaseData.save();

            console.log('PaymentIntent was successful!');

            break;
        }
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            })
            const { purchaseId } = session.data[0].metadata;

            const purchaseData = await Purchase.findById(purchaseId);

            purchaseData.status = "failed";

            await purchaseData.save();

            console.log('PaymentIntent was failed!');

            break;
        }
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });



}
