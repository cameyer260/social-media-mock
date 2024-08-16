import dbConnect from "../../../../lib/db/mongodb.js";
import Post from "../../../../lib/models/Post.js";
import VerifyUser from "../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../reusuableMethods/jwtErrors.js";
import {
    S3Client,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

// aws s3 stuff
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

export const config = {
    api: {
        bodyParser: false, // Disable Next.js body parsing, we will handle it manually
    },
};

// used when a user creates a new post
// whoever made the request is going to have the post made under their account
export async function POST(req) {
    try {
        await dbConnect();
        // first authorize
        const user = await VerifyUser();
        if (!user) {
            throw new Error();
        }

        // harvest formData
        const formData = await req.formData();
        const file = formData.get("image");
        const caption = formData.get("caption");
        console.log(file);
        console.log(caption);
        if(!!file && caption === "") {
            throw new Error("If there is not picture in the post, the post must contain text. Post cannot be empty.");
        }
        let picture = true;
        if(!!file) {
            console.log("FILE IS NULL");
            picture = false;
        }

        // first create post on mongodb collection,
        // then if the post includes an image we upload it to the s3 bucket with it's key being the post _id
        const newPost = Post({
            owner: user._id.toString(),
            caption: caption,
            comments: [],
            likes: [],
            dislikes: [],
            date: new Date().toISOString(),
            hasPicture: picture,
        });
        await newPost.save();

        // if the post has an image with it, we need to upload it to the s3 bucket
        if (newPost.hasPicture) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: newPost._id.toString(), // the key will be the post's _id
                Body: buffer,
            };
            const uploadCommand = new PutObjectCommand(uploadParams);

            await s3.send(uploadCommand);
        }

        return new Response(
            JSON.stringify({ message: "Successfully uploaded post." }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 200,
            }
        );
    } catch (error) {
        console.log(error);

        JWTErrors(error);
        
        if(error.message === "If there is not picture in the post, the post must contain text. Post cannot be empty.") {
            return new Response(
                JSON.stringify({ message: "If there is not picture in the post, the post must contain text. Post cannot be empty." }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 405,
                }
            );
        }

        return new Response(
            JSON.stringify({ message: "Internal server error." }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 500,
            }
        );
    }
}
