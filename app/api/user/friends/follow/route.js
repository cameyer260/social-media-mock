import User from "../../../../../lib/models/User.js";
import { cookies } from "next/headers";
import VerifyUser from "../../../reusuableMethods/verifyUser.js";

const jwt = require("jsonwebtoken");

export async function POST(req) {
    try {
        const body = await req.json();

        const user = await VerifyUser();

        // first we check that the account the user wants to follow exists
        if (!(await User.findOne({ username: body.username }))) {
            throw new Error(
                "The account the user wants to follow does not exist."
            );
        }

        // next we want to check that the user is not already following the account
        if (user.following.includes(body.username)) {
            throw new Error(
                "User is already following the account they have attempted to follow."
            );
        }

        // lastly we check that they are not trying to follow themself
        if (user.username === body.username) {
            throw new Error(
                "User is logged in as the account they are trying to follow."
            );
        }

        // if no errors are thrown we are at a success and add the email to the user's following attribute
        user.following.push(body.username);
        await user.save();

        return new Response(JSON.stringify({ message: "Success." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        });
    } catch (error) {
        console.log(error);

        // user errors
        if (error.message === "Please log in.") {
            return new Response(
                JSON.stringify({
                    message: "Please log in.",
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 401,
                }
            );
        }
        if (
            error.message ===
            "The account the user wants to follow does not exist."
        ) {
            return new Response(
                JSON.stringify({
                    message:
                        "The account the user wants to follow does not exist.",
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 409,
                }
            );
        }
        if (
            error.message ===
            "User is already following the account they have attempted to follow."
        ) {
            return new Response(
                JSON.stringify({
                    message:
                        "User is already following the account they have attempted to follow.",
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 409,
                }
            );
        }
        if (
            error.message ===
            "User is logged in as the account they are trying to follow."
        ) {
            return new Response(
                JSON.stringify({
                    message:
                        "User is logged in as the account they are trying to follow",
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 409,
                }
            );
        }

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
