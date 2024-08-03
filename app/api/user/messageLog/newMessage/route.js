import dbConnect from "../../../../../lib/db/mongodb.js";
import { Message } from "../../../../../lib/models/Message.js";
import MessageLog from "../../../../../lib/models/MessageLog.js";
import User from "../../../../../lib/models/User.js";
import VerifyUser from "../../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../../reusuableMethods/jwtErrors.js";

export async function PATCH(req) {
    try {
        const decoded = await VerifyUser();

        if (!decoded) {
            throw new Error();
        }

        const body = await req.json();
        await dbConnect();
        console.log(body);
        // make sure message is not an empty string
        if (body.content === "") {
            throw new Error("Message cannot be empty.");
        }

        // first, determine who the user sending the message is by their jwt
        // they're account is authorized to send the message if they are friends with the person
        // they want to send the message to (following each other)
        const fromUser = await User.findById(decoded._id);
        const toUser = await User.findOne({ username: body.to });

        console.log(fromUser + "      " + toUser);

        if (
            !fromUser.following.includes(toUser.username) ||
            !toUser.following.includes(fromUser.username)
        ) {
            throw new Error(
                "Cannot send message, you are not friends with this user. To be friends, you both must be following each other."
            );
        }

        // now that we know they're authorized to send the message
        // we check that messageLogs exists for both users
        let fromUserLog = await MessageLog.findOne({
            owner: fromUser._id.toString(),
            to: toUser._id.toString(),
        });
        let toUserLog = await MessageLog.findOne({
            owner: toUser._id.toString(),
            to: fromUser._id.toString(),
        });

        if (!fromUserLog) {
            console.log("fromUserLog not found");
            const newLog1 = new MessageLog({
                owner: fromUser._id.toString(),
                to: toUser._id.toString(),
            });
            await newLog1.save();
            fromUserLog = await MessageLog.findOne({
                owner: fromUser._id.toString(),
                to: toUser._id.toString(),
            });
        }
        if (!toUserLog) {
            console.log("toUserLog not found");
            const newLog2 = new MessageLog({
                owner: toUser._id.toString(),
                to: fromUser._id.toString(),
            });
            await newLog2.save();
            toUserLog = await MessageLog.findOne({
                owner: toUser._id.toString(),
                to: fromUser._id.toString(),
            });
        }

        // now that we know both messageLogs exist, we create the message object
        const newMessage = new Message({
            content: body.content,
            from: fromUser._id.toString(),
            to: toUser._id.toString(),
            timeSent: new Date().toISOString(),
        });

        // message object created, now we upload it to the messageLogs
        console.log(fromUserLog, toUserLog);
        console.log(newMessage);
        fromUserLog.messages.push(newMessage);
        toUserLog.messages.push(newMessage);
        fromUserLog.save();
        toUserLog.save();

        return new Response(
            JSON.stringify({ message: "Message uploaded successfully." }),
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
