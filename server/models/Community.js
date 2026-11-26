import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 21,
        match: [/^[a-zA-Z0-9_]+$/, "Community names can only contain letters, numbers and underscores"]
    },

// The lowercase version of the name, used for searching in the db. This is not returned to the client. 
// Pretty Genius if you ask me. I don't know why I didn't think of this before. I was going to use regex for case-insensitive searching, but this is way better.
    nameLower: {
        type: String,
        required: true,
        unique: true,
        select: false
    },

    description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    memberCount: {
        type: Number,
        default: 1
    }
    
}, 
{
    timestamps: true
});

communitySchema.index({ creator: 1 });

communitySchema.pre("validate", function () {
    if (this.name) {
        this.nameLower = this.name.trim().toLowerCase();
    }
});

communitySchema.statics.findByName = function (name) {
    return this.findOne({ nameLower: String(name).trim().toLowerCase() });
};

const Community = mongoose.model("Community", communitySchema);

export default Community;
