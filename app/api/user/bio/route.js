import VerifyUser from "../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../reusuableMethods/jwtErrors.js";
import dbConnect from "../../../../lib/db/mongodb.js";

export async function PATCH(req) {
    // used to upload a new bio to the user's profile

    try {
        await dbConnect();
        const user = await VerifyUser();
        if(!user) {
            throw new Error();
        }

        const body = await req.json();

        user.bio = body.bio;
        await user.save();

        return new Response(JSON.stringify({ message: "Successfully changed bio." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200
        });
    } catch(error) {
        console.log(error);

        JWTErrors(error);

        return new Response(JSON.stringify({ message: "Internal server errror." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 500,
        });
    }
}