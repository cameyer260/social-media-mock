"use server";

import { cookies } from "next/headers";
import dbConnect from "../../../lib/db/mongodb.js";
import User from "../../../lib/models/User.js";

const jwt = require("jsonwebtoken");

export default async function VerifyUser() {
    // first we make sure they are logged in (check that they have an accessToken jwt)
    if (!cookies().get("accessToken")) {
        throw new Error("Please Log in");
    }

    // then we find their account from their jwt and return it if found (otherwise either an error will be thrown from the jwt.veriy function)
    const user = await jwt.verify(
        cookies().get("accessToken").value,
        process.env.ACCESS_TOKEN_SECRET,
        async function (err, decoded) {
            if (err) {
                throw err;
            }
            await dbConnect();
            return await User.findById(decoded._id);
        }
    );
    return user;
}
