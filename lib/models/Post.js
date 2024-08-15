import { commentSchema } from "./Comment.js";
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    owner: {
        type: String, // user id string
        required: true,
    },
    caption: {
        type: String, // post does not have to have a caption
    },
    comments: [commentSchema], // array of comments
    likes: [String], // array of user id strings that liked it
    dislikes: [String], // array of user id strings that disliked it
    date: {
        type: String,
        required: true,
    },
    hasPicture: {
        type: Boolean, // posts dont have to have pictures with them, but if they do this will be true
        required: true
    }
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

module.exports = Post;