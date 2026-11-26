import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// Protects routes that need a logged-in user.
//
// The client sends the login token in this header:
//     Authorization: Bearer <token>
//
// The token is expected to be made by the login route with:
//     jwt.sign({ id: user._id }, process.env.JWT_SECRET)
// ({ userId: ... } or { _id: ... } inside the token also work.)
//
// If the token is valid, the route can use req.user = { id, username }.
async function protect(req, res, next) {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "You need to log in first"
        });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({
            success: false,
            message: "Your login has expired, please log in again"
        });
    }

    const userId = payload.id || payload.userId || payload._id;
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(401).json({
            success: false,
            message: "Invalid login, please log in again"
        });
    }

    try {
        const user = await User.findById(userId).select("username");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "This account no longer exists"
            });
        }

        req.user = { id: String(user._id), username: user.username };
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export default protect;
