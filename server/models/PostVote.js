import mongoose from "mongoose";

const postVoteSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    value: {
        type: Number,
        enum: [-1, 1],
        required: true
    }
},
    {timestamps: true}
);

postVoteSchema.index({post: 1, user: 1}, {unique: true});
postVoteSchema.index({post: 1, value: 1});
postVoteSchema.index({user: 1, value: 1, createdAt: -1});

const PostVote = mongoose.model("PostVote", postVoteSchema);
export default PostVote;