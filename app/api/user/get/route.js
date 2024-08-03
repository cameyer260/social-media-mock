import VerifyUser from "../../reusuableMethods/verifyUser.js";
import JWTErrors from "../../reusuableMethods/jwtErrors.js";

export async function GET() {
    // returns data about the user who made the request
    try {
        const user = await VerifyUser();
        if(!user) {throw new Error();}
        
        return new Response(JSON.stringify({ message: "Success", user: { email: user.email, name: user.name, username: user.username } }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        });
    } catch (error) {
        JWTErrors(error);

        return new Response(JSON.stringify({ message: "Internal server error." }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 500,
        });
    }
}