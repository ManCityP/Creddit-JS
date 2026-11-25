import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Creddit Backend is running");
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Hello from Creddit"
    });
});


await connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port 5000");
});