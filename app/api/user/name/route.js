import VerifyUser from "../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../reusuableMethods/jwtErrors.js";
import dbConnect from "../../../../lib/db/mongodb.js";

export async function PATCH(req) {
    // used to upload a new name to the user's account

    try {
        await dbConnect();
        // first auth
        const user = await VerifyUser();
        if(!user) {
            throw new Error();
        }
        const body = await req.json();

        if(body.first === "" || body.last === "") {
            throw new Error("First or last name may not be an empty string.");
        }
        
        user.name = body.first + " " + body.last;
        await user.save();

        return new Response(JSON.stringify({ message: "Successfully changed name." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200
        });

    } catch(error) {
        console.log(error);

        JWTErrors(error);

        if(error.message === "First or last name may not be an empty string.") {
            return new Response(JSON.stringify({ message: "First or last name may not be an empty string." }), {
                headers: { 
                    "Content-Type": "application/json"
                },
                status: 422
            });
        }

        return new Response(JSON.stringify({ message: "Internal server errror." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 500,
        });
    }
}