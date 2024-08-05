import dbConnect from "../../../../../lib/db/mongodb.js";
import VerifyUser from "../../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../../reusuableMethods/jwtErrors.js";
import s3 from "../../../../../lib/db/awsConnect.js";
import ProfilePicture from "../../../../../lib/models/ProfilePicture.js";

export async function POST(req) {
    try {
        await dbConnect();
        // first authorization (only your account can upload your profile picture)
        const user = await VerifyUser();
        if (!user) {
            throw new Error();
        }

        // upload new profile picture
        const params = {
            Bucket: "cmeyerbucket",
            Key: user.username,
            Body: req.image,
            ContentType: req.fileType,
        };
        const data = await s3.putObject(params).promise();

        // first check that profile pic does not already exist in db
        const exists = ProfilePicture.findOne({ owner: user._id });
        if (exists) {
            throw new Error(
                "Profile picture already exists. Try updating it instead."
            );
        }

        // now save url to db
        const profilePic = new ProfilePicture({
            owner: user._id,
            imageUrl: data.Location,
            objectKey: user.username,
        });
        await profilePic.save();

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

export async function GET(req, params) {
    try {
        // get profile picture for the user in the request
        await dbConnect();
        // first authorization, any valid account can get your profile picture to view it
        const user = await VerifyUser();
        if (!user) {
            throw new Error();
        }

        // then find imageurl
        const profilePic = await ProfilePicture.findOne({ objectKey: params.username });
        if (!profilePic) {
            throw new Error("Profile picture not found.");
        }

        // if found we then return it in the response
        return new Response(JSON.stringify({ message: "Success.", imgUrl: profilePic.imageUrl }))
    } catch (error) {
        //console.log(error);

        JWTErrors(error);

        if (error.message === "Profile picture not found.") {
            return new Response(
                JSON.stringify({ message: "Profile picture not found." }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 404,
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

export async function PATCH(req) {
    // change profile picture to something else
    // first authorization, only your account can change your profile picture
}

export async function DELETE(req) {
    // removes profile picture, we display default user icon instead
}