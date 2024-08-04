const mongoose = require("mongoose");

const profilePictureSchema = new mongoose.Schema({
    owner: {
        type: String, // user id
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    objectKey: {
        type: String,
        required: true
    }
});

const ProfilePicture = mongoose.models.ProfilePicture || mongoose.model("ProfilePicture", profilePictureSchema);

module.exports = ProfilePicture;