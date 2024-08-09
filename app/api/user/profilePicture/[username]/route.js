import dbConnect from "../../../../../lib/db/mongodb.js";
import VerifyUser from "../../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../../reusuableMethods/jwtErrors.js";

export async function GET(req, context) {
    try {
        // get profile picture for the user in the request
        await dbConnect();
        // first authorization, any valid account can get your profile picture to view it
        const user = await VerifyUser();
        if (!user) {
            throw new Error();
        }

        
        
        return new Response(JSON.stringify({ message: "Success.", url: preSignedUrl }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        });
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