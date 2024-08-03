import dbConnect from "../../../../lib/db/mongodb.js";
import User from "../../../../lib/models/User.js";

export async function POST(req) {
    try {
        await dbConnect();

        const jwt = require("jsonwebtoken");
        const cookie = require("cookie");
        const bcrypt = require("bcryptjs");

        const { email, password } = await req.json();
        const user = await User.findOne({ email });
        const userObject = user.toObject(); // payload for jwt.sign must be a plain javascript object
        const accessToken = jwt.sign(
            userObject,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10d'}
        );

        // first check if a user with the email exists
        if (!user) {
            return new Response(
                JSON.stringify({ message: "Email not found." }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 401,
                }
            );
        }

        // then we use bcrypt to authenticate the passwords
        // converts the password to the hash, checks if it matches the hash in the db
        // if not, returns a 401 response
        await bcrypt.compare(password, user.password, function(err, res) {
            if(err) {throw new Error(err);} else {
                if(!res) {
                    return new Response(
                        JSON.stringify({ message: "Password is incorrect." }),
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                            status: 401,
                        }
                    );
                }
            }
        })

        return new Response(JSON.stringify({ message: "Login successful" }), {
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": cookie.serialize("accessToken", accessToken, {
                    httpOnly: true, // not accessible via javascript
                    secure: process.env.NODE_ENV !== "development", // only sent over https if in production
                    sameSite: "strict", // only sent with same-site requests
                    path: "/", // valid for entire domain
                }),
            },
            status: 200,
        });
        
    } catch (error) {
        console.log(error);
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
