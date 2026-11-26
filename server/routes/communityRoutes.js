import express from "express";
import Community from "../models/Community.js";
import Membership from "../models/Membership.js";
import protect, { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

const COMMUNITY_NAME_REGEX = /^[a-zA-Z0-9_]{3,21}$/;
const DESCRIPTION_MAX = 500;
const DUPLICATE_KEY_ERROR = 11000;

// The creator of a community is its moderator.
// `creator` can be a populated user ({ _id, username }) or just an id.
function isCreator(community, userId) {
    const creator = community.creator;
    if (!creator) return false;
    return String(creator._id || creator) === userId;
}

async function getMemberCount(communityId) {
    const community = await Community.findById(communityId).select("memberCount");
    return community ? community.memberCount : 0;
}

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

        // The creator is the first member (memberCount already starts at 1)
        try {
            await Membership.create({ user: req.user.id, community: created._id });
        } catch (error) {
            // Don't leave a community behind whose member count is wrong
            await Community.deleteOne({ _id: created._id });
            throw error;
        }

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
// Anyone can see it. If you're logged in, it also says if you've joined
// it (isMember) and if you're its moderator (isModerator).
router.get("/:name", optionalAuth, async (req, res) => {
    try {
        const community = await Community.findByName(req.params.name)
            .populate("creator", "username avatar");

        if (!community) {
            return res.status(404).json({
                success: false,
                message: "Community not found"
            });
        }

        let isMember = false;
        let isModerator = false;

        if (req.user) {
            isModerator = isCreator(community, req.user.id);
            isMember = isModerator || Boolean(await Membership.exists({
                user: req.user.id,
                community: community._id
            }));
        }

        res.json({
            success: true,
            community,
            isMember,
            isModerator
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Join a community (must be logged in). Joining twice does nothing.
// POST /api/communities/:name/join
router.post("/:name/join", protect, async (req, res) => {
    try {
        const community = await Community.findByName(req.params.name).select("_id name creator");

        if (!community) {
            return res.status(404).json({
                success: false,
                message: "Community not found"
            });
        }

        // The moderator is always a member, so there's nothing to do for them
        if (!isCreator(community, req.user.id)) {
            // The unique (user, community) index lets only ONE request insert this
            // membership, even if several arrive at the same time. Only that request
            // adds 1 to the member count, so the count can't go wrong.
            let joinedNow = false;
            try {
                await Membership.create({ user: req.user.id, community: community._id });
                joinedNow = true;
            } catch (error) {
                if (error.code !== DUPLICATE_KEY_ERROR) {
                    throw error;
                }
                // Duplicate = already a member, nothing to change
            }

            if (joinedNow) {
                await Community.updateOne(
                    { _id: community._id },
                    { $inc: { memberCount: 1 } }
                );
            }
        }

        res.json({
            success: true,
            message: `Joined r/${community.name}`,
            isMember: true,
            memberCount: await getMemberCount(community._id)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Leave a community (must be logged in). Leaving twice does nothing.
// POST /api/communities/:name/leave
router.post("/:name/leave", protect, async (req, res) => {
    try {
        const community = await Community.findByName(req.params.name).select("_id name creator");

        if (!community) {
            return res.status(404).json({
                success: false,
                message: "Community not found"
            });
        }

        if (isCreator(community, req.user.id)) {
            return res.status(400).json({
                success: false,
                message: `You're the moderator of r/${community.name}, so you can't leave it`
            });
        }

        // deleteOne is atomic: if two "Leave" requests arrive together, only one
        // of them actually deletes the membership (deletedCount === 1), so the
        // member count only goes down once.
        const result = await Membership.deleteOne({
            user: req.user.id,
            community: community._id
        });

        // No "don't go below 0" condition here on purpose: when joins and leaves
        // overlap, the count can dip for a moment before a join's +1 arrives.
        // Skipping a -1 then would leave the count too high forever.
        if (result.deletedCount === 1) {
            await Community.updateOne(
                { _id: community._id },
                { $inc: { memberCount: -1 } }
            );
        }

        res.json({
            success: true,
            message: `Left r/${community.name}`,
            isMember: false,
            memberCount: await getMemberCount(community._id)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
