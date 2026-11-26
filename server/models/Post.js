import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["image", "video", "audio", "file", 'other'],
        default: "image",
    },
    mimeType: {
        type: String,
        trim: true
    },
},
    { _id: false }
);

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    content: {
        type: String,
        default: "",
        trim: true,
        maxlength: 65535
    },
    media: {
      type: [mediaSchema],
      default: [],
      validate: {
          validator: (arr) => arr.length <= 20
      }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        default: null
    },
    score: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    editedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
},
    {timestamps: true}
);

postSchema.index({ createdAt: -1 }); //Sort by newest
postSchema.index({ score: -1, createdAt: -1 }); //Sort by upvotes score

postSchema.index({ community: 1, createdAt: -1 }); //Sort in community by newest
postSchema.index({ community: 1, score: -1, createdAt: -1 }); //Sort in community by upvotes score

postSchema.index({ author: 1, createdAt: -1 }); //Sort in author by newest
postSchema.index({ author: 1, score: -1, createdAt: -1 }); //Sort in author by upvotes score

const Post = mongoose.model("Post", postSchema);
export default Post;