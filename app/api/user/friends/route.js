import dbConnect from "../../../../lib/db/mongodb.js";
import User from "../../../../lib/models/User.js";
import { cookies } from "next/headers";

const jwt = require("jsonwebtoken");

export async function GET() {
    // request called to fetch the list of names of friends the user has
    try {
        // first we make sure they are logged in (check that they have an accessToken jwt)
        if (!cookies().get("accessToken")) {
            throw new Error("Please log in.");
        }

        // then we find their account from their jwt
        // if verified successfully, we return the array of friends
        const theirFriends = [];
        await jwt.verify(
            cookies().get("accessToken").value,
            process.env.ACCESS_TOKEN_SECRET,
            async function (err, decoded) {
                if (err) {
                    throw err;
                }

                await dbConnect();
                // fetch user by id
                const user = await User.findById(decoded._id);
                // iterate through users following to see who follows them back
                // whomever follows them back are considered 'friends', which we return in an array in the http response
                const friendPromises = user.following.map(async (element) => {
                    const otherUser = await User.findOne({ username: element });
                    if(otherUser && otherUser.following.includes(user.username)) {
                        theirFriends.push(element);
                    }
                });

                await Promise.all(friendPromises);
            }
        );
        
        return new Response(JSON.stringify({ message: "Success", friends: theirFriends}), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        })

    } catch (error) {
        console.log(error);

        if(error.message === "Please log in.") {
            return new Response(JSON.stringify({ message: "Please log in." }), {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 401,
            });
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
