const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [emailRegex, "Please enter a valid email address"],
        },
        passwordHash: { type: String, required: true },
        bio: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);