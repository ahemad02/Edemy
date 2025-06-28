import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

// Routes
app.get("/", (req, res) => {
    res.send("Hello from the backend!");
});

app.post("/clerk", clerkWebhooks);
app.use("/api/educator", educatorRouter)



const PORT = process.env.PORT || 3001;

await connectCloudinary();
await connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});