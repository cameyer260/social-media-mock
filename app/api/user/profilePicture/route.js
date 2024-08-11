import dbConnect from "../../../../lib/db/mongodb.js";
import VerifyUser from "../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../reusuableMethods/jwtErrors.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

// aws s3 stuff
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

// mutler stuff
const multer = require("multer");
// save file in ram
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export async function POST(req) {
    // upload new profile picture
    try {
        await dbConnect();
        // first authorization (only your account can upload your profile picture)
        const user = await VerifyUser();
        if (!user) {
            throw new Error();
        }

        upload.single('image')(req, new Response(), (err) => {
            if(err) {
                throw err;
            }
        });

        // first we want to check if they already have a profile pic, if so we want to delete it before storing a new one
        const checkParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: user._id.toString(),
        }
        const checkCommand = new HeadObjectCommand(checkParams);
        try {
            await s3.send(checkCommand);
            // if we are at this line of code, the image exists and needs to be deleted
            const deleteParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: user._id.toString(),
            }
            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3.send(deleteCommand);
        } catch(er) {
            if(er.name !== "NotFound") {
                throw new Error("Error checking if image already exists.");
            }
        }

        // now we can store the new one
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: user._id.toString(),
            Body: req.buffer,
            ContentType: req.mimetype,
        }
        const uploadCommand = new PutObjectCommand(uploadParams);

        await s3.send(uploadCommand);

        return new Response(
            JSON.stringify({ message: "Successfully uploaded picture." }),
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

export async function DELETE(req) {
    // removes profile picture, we display default user icon instead
    try {
        await dbConnect();
        // first authorization (only your account can upload your profile picture)
        const user = await VerifyUser();
        if (!user) {
            throw new Error();
        }

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: user._id.toString(),
        }
        const command = new DeleteObjectCommand(params);
        await s3.send(command);

        return new Response(
            JSON.stringify({ message: "Successfully removed profile picture." }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 200,
            }
        );
    } catch(error) {
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