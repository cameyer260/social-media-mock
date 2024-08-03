import { messageSchema } from "./Message.js";
const mongoose = require("mongoose");

const messageLogSchema = new mongoose.Schema({
    owner: {
        type: String, // userid
        required: true,
    },
    messages: {
        type: [messageSchema],
        default: [],
    },
    to: {
        type: String, // userId
        required: true,
    }
});

const MessageLog = mongoose.models.MessageLog || mongoose.model("MessageLog", messageLogSchema);

module.exports = MessageLog;