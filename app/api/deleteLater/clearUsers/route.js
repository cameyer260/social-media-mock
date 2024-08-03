import User from "../../../../lib/models/User.js";
import dbConnect from "../../../../lib/db/mongodb.js";

export async function POST() {
    await dbConnect();

    await User.deleteMany({});

    return new Response({ message: "Success" }, { status: 200 });
}