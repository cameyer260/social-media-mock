import dbConnect from "../../../../lib/db/mongodb";
import User from "../../../../lib/models/User";

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password, username } = await req.json();

        // first check if email is already taken
        if (await User.findOne({ email })) {
            return new Response(
                JSON.stringify({
                    message:
                        "We already have an account under this email. Try logging in.",
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 409,
                }
            );
        }

        // now that we know the email is not already taken, we create a new user
        const bcrypt = require("bcryptjs"); // bycrpt to hash the password and add a salt
        await bcrypt.genSalt(10, function (err, salt) {
            if(err) {
                throw new Error(err);
            }
            bcrypt.hash(password, salt, async function (err, hash) {
                if(err) {
                    throw new Error(err);
                }
                const newUser = new User({
                    username: username,
                    email: email,
                    password: hash,
                });
                await newUser.save();
            });
        });

        // now we log them in
        const res = await fetch("http://localhost:3000/api/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
            credentials: 'include'
        })
        return res;
        
    } catch (error) {
        console.log(error);
        return new Response(
            JSON.stringify({ message: "Internal server error" }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 500,
            }
        );
    }
}
