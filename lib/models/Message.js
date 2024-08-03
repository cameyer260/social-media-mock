const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    from: {
        type: String, // userid
        required: true,
    },
    to: {
        type: String, // userid
        required: true,
    },
    timeSent: {
        type: String,
        required: true,
    }
});

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

module.exports = {
    Message,
    messageSchema,
}