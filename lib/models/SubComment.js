const mongoose = require("mongoose");

const subCommentSchema = new mongoose.Schema({
    from: {
        type: String, // user id
        required: true
    },
    text: {
        type: String, 
        required: true // cant be empty
    },
    date: {
        type: String, 
        required: true
    }
});

const SubComment = mongoose.models.SubComment || mongoose.model("SubComment", subCommentSchema);

module.exports = {
    SubComment,
    subCommentSchema
}