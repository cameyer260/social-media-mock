"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "../context/GlobalContext.js";

export default function Navbar() {
    const [toggle, setToggle] = useState(false);
    const router = useRouter();
    const { user, loading } = useGlobalContext();

    return (
        <div className="bg-black text-white font-bold text-2xl flex pb-1 border-b-2 border-white">
            <div className="space-x-4">
                <Link href="/">Home</Link>
                <Link href="/explore">Explore</Link>
                <Link href="/messages">Messages</Link>
                <Link href="/friends">Friends</Link>
            </div>
            <div className="ml-auto pr-20 relative">
                {loading ? (
                    <div> loading animation </div>
                ) : (
                    <div>
                        {user ? (
                            <button onClick={() => setToggle(!toggle)}>
                                {user.username}
                            </button>
                        ) : (
                            <p className="text-m">Not logged in.</p>
                        )}
                        {toggle && (
                            <div
                                style={{ borderRadius: "0 0 10px 10px" }}
                                className="absolute text-white bg-black flex flex-col space-y-2 pl-2 shadow-lg -translate-x-2 w-screen"
                            >
                                <button
                                    onClick={() => {
                                        router.push("/profile");
                                        setToggle(!toggle);
                                    }}
                                    className="text-left"
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={() => {
                                        router.push("/settings");
                                        setToggle(!toggle);
                                    }}
                                    className="text-left"
                                >
                                    Settings
                                </button>
                                <button
                                    onClick={async () => {
                                        const res = await fetch("/api/user/logout", {
                                            method: "POST",
                                            credentials: "include",
                                        });
                                        const result = await res.json();
                                        console.log(result);
                                        setToggle(false);
                                        window.location.reload();
                                    }}
                                    className="text-left"
                                >
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
