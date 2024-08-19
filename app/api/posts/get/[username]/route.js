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
            // first get likes
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
            // then dislikes
            const dislikes = [];
            for(const dislike in post.dislikes) {
                const theUser = await User.findById(dislike);
                const getParams = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: theUser._id.toString(),
                };
                const getCommand = new GetObjectCommand(getParams);
                const signedUrl = await getSignedUrl(s3, getCommand, {
                    expiresIn: 3600 * 24,
                });
                dislikes.push({
                    username: theUser.username,
                    signedUrl: signedUrl,
                });
            }
            // then comments
            const comments = [];
            for(const comment in post.comments) {
                const theUser = await User.findById(comment.from); // get username from _id
                // get subcomments
                const subComments = [];
                for(const subComment in comment.comments) {
                    const theUser = await User.findById(subComment.from);
                    const getParams = {
                        Bucket: process.env.BUCKET_NAME,
                        Key: theUser._id.toString(),
                    };
                    const getCommand = new GetObjectCommand(getParams);
                    const signedUrl = await getSignedUrl(s3, getCommand, {
                        expiresIn: 3600 * 24,
                    });
                    subComments.push({
                        from: theUser.username,
                        text: subComment.text,
                        data: subComment.data,
                    });
                }
                theComment = {
                    from: theUser.username,
                    text: comment.text,
                    comments: subComments,
                    date: comment.date,
                }
                comments.push(theComment);
            }
            let signedUrl = null;
            if(post.hasPicture) {
                const getParams = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: post._id.toString(),
                };
                const getCommand = new GetObjectCommand(getParams);
                signedUrl = await getSignedUrl(s3, getCommand, {
                    expiresIn: 3600 * 24,
                });
            }
            posts.push({
                owner: otherUser.username,
                caption: post.caption,
                comments: comments,
                likes: likes,
                dislikes: dislikes,
                date: post.date,
                pictureLink: signedUrl,
            });
        }

        return new Response(JSON.stringify({ message: "Success.", posts: posts }), {
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