import VerifyUser from "../../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../../reusuableMethods/jwtErrors.js";
import User from "../../../../../lib/models/User.js";
import dbConnect from "../../../../../lib/db/mongodb.js";

// returns data about the user requested
export async function GET(req, context) {
    try {
        const user = await VerifyUser();
        const { params } = context;
        
        if(!user) {
            // something unexpected happened (user's _id attribute potentially changed or something like that)
            throw new Error(); // we will send a internal server error message for it
        }

        await dbConnect();
        // now that we know they authorized (as long as they have an account and are logged in they can view other accounts), 
        // we try to find the user they are looking for
        const search = await User.findOne({ username: params.username });
        // check that the user exists
        if(!search) {
            throw new Error("User does not exist.");
        }
        // see who is following our user for the followers attribute
        const followers = await User.find({ following: { $in: [params.username] } });
        // now we know the username they looked up is an actual user, so we send back data about the user inside an object
        const data = {
            name: search.name,
            username: search.username,
            email: search.email,
            following: search.following,
            followers: followers.map((follower) => follower.username),
            profilePicURL: "idk how to do dis one yet",
            // check if the user is viewing their own page, if they are they have permission to edit things on it
            isEditable: (search._id.toString() === user._id.toString()) ? true : false, 
            bio: search.bio,
        }


        return new Response(JSON.stringify({ message: "Success", data: data }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        });

    } catch (error) {
        //console.log(error);

        JWTErrors(error);

        if(error.message === "User does not exist.") {
            return new Response(JSON.stringify({ message: "User does not exist." }), {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 404
            });
        }

        return new Response(JSON.stringify({ message: "Internal server error." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 500,
        });

    }
}