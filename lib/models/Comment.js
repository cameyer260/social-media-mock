const mongoose = require("mongoose");
import { subCommentSchema } from "../models/SubComment.js";

const commentSchema = new mongoose.Schema({
    from: {
        type: String, // user id
        required: true,
    },
    text: {
        type: String, // the actual comment
        required: true, // cant be empty
    },
    // technically, the max depth allowed in commenting is commenting a comment on a post
    // but when you try to comment a comment of a comment of a post, the front end will 
    // automatically make the comment applied towards the root comment (the one on the post)
    // but add an @username to text field of who the person wanted to reply to
    comments: [subCommentSchema], // array of other comment object ids
    date: {
        type: String,
        required: true,
    }
})

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

module.exports = {
    Comment,
    commentSchema,
}