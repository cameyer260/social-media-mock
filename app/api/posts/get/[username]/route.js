import dbConnect from "../../../../../lib/db/mongodb.js";
import VerifyUser from "../../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../../reusuableMethods/jwtErrors.js";
import Post from "../../../../../lib/models/Post.js";
import User from "../../../../../lib/models/User.js";
import {
    S3Client,
    GetObjectCommand
} from "@aws-sdk/client-s3";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// aws s3 stuff
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

// used for profile page. when viewing someone's account, (including your own), 
// the useEffect will fetch all the user's posts (using this api route) to display them
export async function GET(req, context) {
    try {
        const { params } = context;
        await dbConnect();
        
        // authorization (only valid accounts can view other account's posts)
        const user = await VerifyUser();
        if(!user) {
            throw new Error();
        }

        const otherUser = await User.findOne({ username: params.username });
        if(!otherUser) {
            throw new Error("Profile does not exist.");
        }

        // this will be the array of the user's posts
        // each post object will be basically be the mongoose schema post but without the _id attribute or any user ids in the other attributes
        // the posts will then be sorted from most recent to least recent
        const posts = [];
        const theirPosts = await Post.find({ owner: otherUser._id.toString() });
        console.log(theirPosts);
        for(const post in theirPosts) {
            const likes = [];
            for(const like in post.likes) {
                const theUser = await User.findById(like);
                const getParams = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: theUser._id.toString(),
                };
                const getCommand = new GetObjectCommand(getParams);
                const signedUrl = await getSignedUrl(s3, getCommand, {
                    expiresIn: 3600 * 24,
                });
                likes.push({
                    username: theUser.username,
                    signedUrl: signedUrl,
                });
            }
            for(const dislike in post.dislikes) {
                
            }
        }

        return new Response(JSON.stringify({ message: "Success." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        });
    } catch(error) {
        console.log(error);

        JWTErrors(error);

        if(error.message === "Profile does not exist.") {
            return new Response(JSON.stringify({ message: "Profile does not exist."}), {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 404,
            });
        }

        return new Response(JSON.stringify({ message: "Internal server error" }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 500,
        });
    }
}