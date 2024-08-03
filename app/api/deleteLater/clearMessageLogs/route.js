import MessageLog from "../../../../lib/models/MessageLog.js";
import dbConnect from "../../../../lib/db/mongodb.js";

export async function POST() {
    await dbConnect();

    await MessageLog.deleteMany({});

    return new Response({ message: "Success" }, { status: 200 });
}