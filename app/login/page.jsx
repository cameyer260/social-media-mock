"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault(); // stop default submission behavior (refreshing the page when submitted) from happening
        const res = await fetch("/api/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
            credentials: "include",
        });
        const result = await res.json();
        console.log(result);
        if (res.ok && res.status === 200) {
            router.push("/");
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100">
            <h1 className="text-3xl mb-2 font-medium">Login</h1>
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
                    <button
                        type="submit"
                        className="border-2 border-black rounded-lg m-1 px-2"
                    >
                        Submit
                    </button>
                </div>
                <div className="flex">
                    <h4>
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-sky-400 underline">
                            Sign up.
                        </Link>
                    </h4>
                </div>
            </form>
        </div>
    );
}
