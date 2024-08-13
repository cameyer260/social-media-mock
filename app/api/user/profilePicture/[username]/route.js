import dbConnect from "../../../../../lib/db/mongodb.js";
import VerifyUser from "../../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../../reusuableMethods/jwtErrors.js";
import User from "../../../../../lib/models/User.js";
import {
    S3Client,
    GetObjectCommand,
    HeadObjectCommand,
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

export async function GET(req, context) {
    try {
        // get profile picture for the user in the request
        await dbConnect();
        // first authorization, any valid account can get your profile picture to view it
        const user = await VerifyUser();
        if (!user) {
            throw new Error();
        }

        // now we find the user whose profile picture they are trying to fetch
        const { params } = context;
        const otherUser = await User.findOne({ username: params.username });
        if (!otherUser) {
            throw new Error(
                "User whose profile picture you are trying to fetch does not exist."
            );
        }

        // // then we check if the profile picture does not exist (user doesnt have profile picture)
        // const checkParams = {
        //     Bucket: process.env.BUCKET_NAME,
        //     Key: otherUser._id.toString(),
        // };
        // const checkCommand = new HeadObjectCommand(checkParams);
        // try {
        //     await s3.send(checkCommand);
        // } catch (er) {
        //     if (er.name === "NoSuchKey" || er.$metadata?.httpStatusCode === 404) {
        //         // Handle the case where the profile picture does not exist.
        //         throw new Error("User does not have a profile picture.");
        //     } else {
        //         // Re-throw other errors for further handling.
        //         throw er;
        //     }
        // }

        // if no error has been thrown we successfully verified that the user has a profile picture
        // this is done so that the presigned url actually leads to an image and not an access denied/not found page
        // now we can return the presigned url
        const getParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: otherUser._id.toString(),
        };
        const getCommand = new GetObjectCommand(getParams);
        const signedUrl = await getSignedUrl(s3, getCommand, {
            expiresIn: 3600 * 24,
        });

        return new Response(
            JSON.stringify({ message: "Success.", signedUrl: signedUrl }),
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
