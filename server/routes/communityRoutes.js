import express from "express";
import Community from "../models/Community.js";
import protect from "../middleware/auth.js";

const router = express.Router();

const COMMUNITY_NAME_REGEX = /^[a-zA-Z0-9_]{3,21}$/;
const DESCRIPTION_MAX = 500;
const DUPLICATE_KEY_ERROR = 11000;

// Create a community (must be logged in)
// POST /api/communities
// body: { name, description }
router.post("/", protect, async (req, res) => {
    const { name, description = "" } = req.body || {};

    if (typeof name !== "string" || !COMMUNITY_NAME_REGEX.test(name.trim())) {
        return res.status(400).json({
            success: false,
            message: "Community names must be 3-21 characters and can only contain letters, numbers and underscores"
        });
    }

    if (typeof description !== "string" || description.trim().length > DESCRIPTION_MAX) {
        return res.status(400).json({
            success: false,
            message: `Description can be at most ${DESCRIPTION_MAX} characters`
        });
    }

    try {
        const created = await Community.create({
            name: name.trim(),
            description: description.trim(),
            creator: req.user.id
        });

        const community = await Community.findById(created._id)
            .populate("creator", "username avatar");

        res.status(201).json({
            success: true,
            message: "Community created successfully",
            community
        });

    } catch (error) {
        if (error.code === DUPLICATE_KEY_ERROR) {
            return res.status(409).json({
                success: false,
                message: `r/${name.trim()} is already taken`
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)[0]?.message || "Invalid community details"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get one community by name (capital letters don't matter)
// GET /api/communities/:name
router.get("/:name", async (req, res) => {
    try {
        const community = await Community.findByName(req.params.name)
            .populate("creator", "username avatar");

        if (!community) {
            return res.status(404).json({
                success: false,
                message: "Community not found"
            });
        }

        res.json({
            success: true,
            community
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
