import dbConnect from "../../../../lib/db/mongodb.js";
import MessageLog from "../../../../lib/models/MessageLog.js";

export async function GET() {
    await dbConnect();
    const messageLogs = await MessageLog.find({});
    return new Response(messageLogs, { status: 200 });
}