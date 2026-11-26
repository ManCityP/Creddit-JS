import User from "../models/User.js";

//TODO: Make a real authentication function

export default async function auth(req, res, next) {
    try {
        const testUser = await User.findOne({ username: "test" });
        if (!testUser) {
            return res
                .status(401)
                .json({ message: "Test user not found. Hit /api/test/create-user first." });
        }
        req.userId = testUser._id;
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Auth check failed", error: error.message });
    }
}