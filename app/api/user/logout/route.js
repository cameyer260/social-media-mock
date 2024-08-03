import { cookies } from "next/headers";

export async function POST() {
    try {
        cookies().delete('accessToken');
        return new Response(JSON.stringify({ message: "You have been logged out."}), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200
        });
    } catch(er) {
        return new Response(JSON.stringify({ message: "Failed to log you out. Please try again.", error: er }), {
            headers: {
                "Content-Type": "application/json",
            },
            status: 500
        });
    }
}