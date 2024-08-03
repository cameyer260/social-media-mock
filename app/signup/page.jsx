"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault(); // stop default submission behavior (refreshing the page when submitted) from happening
        try {
            const response = await fetch("/api/user/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email, password: password, username: username }),
            });
            const result = await response.json();
            console.log(result);
            if(response.ok && response.status === 200) {
                router.push("/profile"); // send them to finish setting up their profile
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100">
            <h1 className="text-3xl mb-2 font-medium">Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <div className="flex justify-center">
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email"
                        className="border-2 border-black rounded-lg m-1 pl-1"
                    />
                </div>
                <div className="flex justify-center">
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        className="border-2 border-black rounded-lg m-1 pl-1"
                    />
                </div>
                <div className="flex justify-center">
                    <input
                        type="string"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        className="border-2 border-black rounded-lg m-1 pl-1"
                    />
                </div>
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="border-2 border-black rounded-lg m-1 px-2"
                    >
                        Submit
                    </button>
                </div>
                <div className="flex">
                    <h4>
                        Already have an account?{" "}
                        <Link href="/login" className="text-sky-400 underline">
                            Login.
                        </Link>
                    </h4>
                </div>
            </form>
        </div>
    );
}
