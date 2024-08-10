import dbConnect from "../../../../lib/db/mongodb.js";
import VerifyUser from "../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../reusuableMethods/jwtErrors.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

        // if no error is thrown, the file has been processed by multer and we can move on to storing it
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: user._id.toString(),
            Body: req.buffer,
            ContentType: req.mimetype,
        }
        const command = new PutObjectCommand(params);

        await s3.send(command);

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
}