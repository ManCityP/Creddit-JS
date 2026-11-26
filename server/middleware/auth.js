import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// Login checks for routes.
//
// The client sends the login token in this header:
//     Authorization: Bearer <token>
//
// The token is made by the login route in server.js with:
//     jwt.sign({ id: user._id }, process.env.JWT_SECRET)
//
// protect      -> the route needs a logged-in user (otherwise 401)
// optionalAuth -> the route works for everyone, but knows who you are if you're logged in
//
// Both give the route req.user = { id, username } when the login is valid.

// Reads the token and finds the user.
// Returns { user } if the login is valid, or { error } explaining why not.
async function getLoggedInUser(req) {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
        return { error: "You need to log in first" };
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return { error: "Your login has expired, please log in again" };
    }

    const userId = payload.id || payload.userId || payload._id;
    if (!mongoose.isValidObjectId(userId)) {
        return { error: "Invalid login, please log in again" };
    }

    const user = await User.findById(userId).select("username");
    if (!user) {
        return { error: "This account no longer exists" };
    }

    return { user: { id: String(user._id), username: user.username } };
}

async function protect(req, res, next) {
    try {
        const { user, error } = await getLoggedInUser(req);

        if (error) {
            return res.status(401).json({
                success: false,
                message: error
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export async function optionalAuth(req, res, next) {
    try {
        const { user } = await getLoggedInUser(req);

        // Not logged in (or the login expired) is fine here: just continue without req.user
        if (user) {
            req.user = user;
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export default protect;
