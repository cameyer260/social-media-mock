import dbConnect from "../../../../lib/db/mongodb.js";
import s3 from "../../../../lib/db/awsConnect.js";
import VerifyUser from "../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../reusuableMethods/jwtErrors.js";
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
        upload.single('image'); // tells multer we are expect one image file called image, it will throw an error if this is not the case

        // first check if user already has a profile picture uploaded
        const searchParams = {
            Bucket: "cmeyerbucket",
            Key: user.username
        }
        let exists = null;
        try {
            exists = await s3.headObject(searchParams).promise();
        } catch(error) {
            if(error.code === "NotFound") {
                exists = null;
            } else throw new Error();
        }
        if(exists) {
            // alter the already exists profile picture
            console.log("exists is true");
        } else {
            // else upload new profile picture
            const params = {
                Bucket: "cmeyerbucket",
                Key: user.username,
                Body: req.file,
            };
            await s3.putObject(params).promise();
        }

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