import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./route.js";
import cors from 'cors';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "musicUserdb",
        });
        console.log("MongoDb connected");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
app.get("/", (req, res) => {
    res.send("Server is running");
});
app.use("/api/v1", userRoutes);
app.listen(port, async () => {
    await connectDb();
    console.log(`Server is running at port ${port}`);
});
//# sourceMappingURL=index.js.map