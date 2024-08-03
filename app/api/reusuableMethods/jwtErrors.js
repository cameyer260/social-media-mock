export default function JWTErrors(error) {
    if(error.message === "Please Log in.") {
        return new Response(
            JSON.stringify({
                message: "Please log in.",
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 401,
            }
        );
    }
    // jwt errors
    if (error.name === "TokenExpiredError") {
        return new Response(
            JSON.stringify({
                message: `Token expired at ${error.expiredAt}. Please logout and log back in.`,
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 401,
            }
        );
    }

    if (error.name === "JsonWebTokenError") {
        return new Response(
            JSON.stringify({
                message: "Invalid JWT. Please logout and log back in.",
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 401,
            }
        );
    }
}