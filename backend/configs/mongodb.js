import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log("Connected to MongoDB");
    })

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    if (!conn) {
        throw new Error("Failed to connect to MongoDB");
    }

}

export default connectDB;