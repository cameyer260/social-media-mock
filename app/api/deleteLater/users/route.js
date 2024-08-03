import dbConnect from "../../../../lib/db/mongodb.js";
import User from "../../../../lib/models/User.js";

export async function GET() {
    await dbConnect();
    const users = await User.find({});
    return new Response(users, { status: 200 });
}
