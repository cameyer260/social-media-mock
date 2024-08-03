import dbConnect from "../../../../../lib/db/mongodb.js";
import User from "../../../../../lib/models/User.js";
import { cookies } from "next/headers";

const jwt = require("jsonwebtoken");

export async function POST(req) {
    try {
        const body = await req.json();

        // make sure they're logged in
        if (!cookies().get("accessToken")) {
            throw new Error("User is not logged in.");
        }

        // find account from jwt, and edit their following attribute list accordingly
        await jwt.verify(
            cookies().get("accessToken").value,
            process.env.ACCESS_TOKEN_SECRET,
            async function (err, decoded) {
                if (err) {
                    throw err;
                }

                await dbConnect();
                const user = await User.findById(decoded._id);
                console.log(user);
                user.following = user.following.filter(
                    (email) => email !== body.email
                );
                console.log(user);
                await user.save();
            }
        );

        return new Response(JSON.stringify({ message: "User unfollowed" }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        });
    } catch (error) {
        console.log(error);

        // jwt errors
        if (error.name === "TokenExpiredError") {
            return new Response(
                JSON.stringify({
                    message: `Token expired at ${error.expiredAt}. Please logout and log back in.`,
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 401,
                }
            );
        }

        if (error.name === "JsonWebTokenError") {
            return new Response(
                JSON.stringify({
                    message: "Invalid JWT. Please logout and log back in.",
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 401,
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
