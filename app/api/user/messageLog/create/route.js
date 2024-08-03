import MessageLog from "../../../../../lib/models/MessageLog.js";
import dbConnect from "../../../../../lib/db/mongodb.js";
import { cookies } from "next/headers";
import User from "../../../../../lib/models/User.js";
import VerifyUser from "../../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../../reusuableMethods/jwtErrors.js";

export async function POST(req) {
    // create new message log

    try {
        const decoded = await VerifyUser();
        const body = await req.json();

        await dbConnect();
                const otherUser = await User.findOne({ username: body.username });
                // first check that the other user exists
                if(!otherUser) {
                    throw new Error("The user you are trying to message does not exist.");
                }

                // check that messageLog does not already exist
                if(await MessageLog.findOne({ owner: decoded._id, to: otherUser._id.toString() })) {
                    throw new Error("MessageLog already exists.");
                }

                // now we create the messageLog (which is empty until they send a message)
                const newMessageLog = new MessageLog({
                    owner: decoded._id,
                    to: otherUser._id.toString(),
                });
                await newMessageLog.save();
        
        return new Response(JSON.stringify({ message: "MessageLog successfully created." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        });

    } catch (error) {
        console.log(error);
        // user errors
        if(error.message === "MessageLog already exists.") {
            return new Response(JSON.stringify({ message: "MessageLog already exists."}), {
                headers: {
                    "Content-Type": "application/json"
                },
                status: 409,
            });
        }
        if(error.message === "The user you are trying to message does not exist.") {
            return new Response(JSON.stringify({ message: "The user you are trying to message does not exist."}), {
                headers: {
                    "Content-Type": "application/json"
                },
                status: 404,
            });
        }

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