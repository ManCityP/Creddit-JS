import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes

export default async function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.sessionId || !decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        const session = await Session.findById(decoded.sessionId);

        if (!session || session.userId.toString() !== decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Session not found. Please log in again."
            });
        }

        const now = Date.now();

        if (session.expiresAt.getTime() <= now) {
            await Session.findByIdAndDelete(session._id);

            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again."
            });
        }

        // Extend the session by another 60 minutes.
        session.lastActivityAt = new Date(now);
        session.expiresAt = new Date(now + INACTIVITY_TIMEOUT);

        await session.save();

        req.userId = session.userId;
        req.sessionId = session._id;

        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please log in again."
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication check failed"
        });
    }
}
