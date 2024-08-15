const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    from: {
        type: String, // user id
        required: true,
    },
    text: {
        type: String, // the actual comment
        required: true, // cant be empty
    },
    comments: [commentSchema], // comments can also have comments on them
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