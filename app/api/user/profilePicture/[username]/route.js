import dbConnect from "../../../../../lib/db/mongodb.js";
import VerifyUser from "../../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../../reusuableMethods/jwtErrors.js";
import s3 from "../../../../../lib/db/awsConnect.js";

export async function GET(req, context) {
    try {
        // get profile picture for the user in the request
        await dbConnect();
        // first authorization, any valid account can get your profile picture to view it
        const user = await VerifyUser();
        if (!user) {
            throw new Error();
        }

        const { params } = context;
        
        // check that it exists first
        const searchParams = {
            Bucket: "cmeyerbucket",
            Key: params.username
        };
        let exists = null;
        try {
            exists = await s3.headObject(searchParams).promise();
        } catch(error) {
            if(error.code === "NotFound") {
                exists = null;
            } else throw new Error();
        }
        if(!exists) {
            throw new Error("Profile picture not found.");
        }

        // now that we know it exists, we generate a presigned url that expires in 3 min and return it
        const uploadParams = {
            Bucket: "cmeyerbucket",
            Key: params.username,
            Expires: 60*3, // 3 minutes
        };
        const preSignedUrl = await s3.getSignedUrl("getObject", uploadParams);
        
        return new Response(JSON.stringify({ message: "Success.", url: preSignedUrl }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        });
    } catch (error) {
        console.log(error);

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