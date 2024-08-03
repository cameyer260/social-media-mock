"use client";

import Link from "next/link";

export default function NotLoggedIn() {

    return (
        <div className="flex w-screen h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white items-center justify-center">
            <h1 className="text-xl">
                Please{" "}
                <Link className="text-sky-400 underline" href={"/login"}>
                    log in.
                </Link>
            </h1>
        </div>
    );
}