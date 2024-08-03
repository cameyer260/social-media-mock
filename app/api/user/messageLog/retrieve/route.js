import dbConnect from "../../../../../lib/db/mongodb.js";
import MessageLog from "../../../../../lib/models/MessageLog.js";
import User from "../../../../../lib/models/User.js";
import { cookies } from "next/headers";

const jwt = require("jsonwebtoken");

function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const middle = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, middle));
    const right = mergeSort(arr.slice(middle));
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    while (left.length && right.length) {
        if(!left[0].messages[left[0].messages.length-1] || !right[0].messages[right[0].messages.length-1]) {
            if(!left[0].messages[left[0].messages.length-1]) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        } else {
            const leftDate = new Date(left[0].messages[left[0].messages.length-1].timeSent);
            const rightDate = new Date(right[0].messages[right[0].messages.length-1].timeSent);
            if (rightDate < leftDate) result.push(left.shift());
            else result.push(right.shift());
        }
    }
    return result.concat(left, right);
}

export async function GET() {
    // return message log

    try {
        // make sure user is logged in
        if (!cookies().get("accessToken")) {
            throw new Error("User not logged in.");
        }

        const messageArray = []; // array we will return, instead of _id we use email

        // authorization
        await jwt.verify(
            cookies().get("accessToken").value,
            process.env.ACCESS_TOKEN_SECRET,
            async function (err, decoded) {
                if (err) {
                    throw err;
                }

                await dbConnect();

                // find messageLogs belonging to user
                const userMessages = await MessageLog.find({ owner: decoded._id });
                const ourUser = await User.findById(decoded._id);

                // first convert the unsorted array of messageLogs returned by MessageLog.find to the array of objects we will return to the user
                // we want to iterate through userMessages using a for loop because the loop will wait for our async function to resolve promises, unlike more typically used loops such as map or .forEach()
                for (const log of userMessages) {
                    const toUser = await User.findById(log.to);
                    // convert messages to new message objects with emails instead of ._id
                    const alteredMessages = [];
                    for(const message of log.messages) {
                        alteredMessages.push({
                            content: message.content,
                            from: (decoded._id === message.from) ? ourUser.username : toUser.username,
                            to: (decoded._id === message.from) ? ourUser.username : toUser.username,
                            timeSent: message.timeSent,
                        });
                    }
                    const newLog = {
                        ownerUsername: ourUser.username,
                        toUsername: toUser.username,
                        messages: alteredMessages,
                    }
                    messageArray.push(newLog);
                }
            }
        );

        // finally, sort the messageArray and return it in the response to the user
        mergeSort(messageArray);


        return new Response(JSON.stringify({ message: "Messages fetched.", messages: messageArray }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        });

    } catch (error) {
        console.log(error);

        return new Response(JSON.stringify({ message: "Internal server errror." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 500,
        });
    }
}
