import dbConnect from "../../../../lib/db/mongodb.js";
import VerifyUser from "../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../reusuableMethods/jwtErrors.js";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
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

export async function POST(req) {
    // upload new profile picture
    try {
        await dbConnect();
        // first authorization (only your account can upload your profile picture)
        const user = await VerifyUser();
        if (!user) {
            throw new Error();
        }

        const formData = await req.formData();
        const file = formData.get("image");

        if(!file) {
            throw new Error("Error receiving image file from the request.");
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log(buffer);
        console.log(file.type);

        // now we can store the new one
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: user._id.toString(),
            Body: buffer,
        };
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

        // then we remove their profile picture from the aws bucket
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: user._id.toString(),
        };
        const command = new DeleteObjectCommand(params);
        await s3.send(command);

        return new Response(
            JSON.stringify({
                message: "Successfully removed profile picture.",
            }),
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
