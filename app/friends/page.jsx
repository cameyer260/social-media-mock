"use client";

import { useState, useEffect } from "react";
import { useGlobalContext } from "../context/GlobalContext.js";
import Loading from "../components/loading.js";
import NotLoggedIn from "../components/notLoggedIn.js";

export default function FriendsPage() {
    const [search, setSearch] = useState("");
    const [friends, setFriends] = useState([]);
    const [searchSubmitted, setSearchSubmitted] = useState(false);
    const { user, loading } = useGlobalContext();

    useEffect(() => {
        try {
            const fetchFriends = async () => {
                const res = await fetch("/api/user/friends", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                const result = await res.json();
                setFriends(result.friends);
            };
            fetchFriends();
        } catch (error) {
            console.log(error);
        }
    }, [searchSubmitted]);

    const unfollow = async (friend) => {
        try {
            const res = await fetch("/api/user/friends/unfollow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: friend }),
                credentials: "include",
            });

            const result = await res.json();
            console.log(result);
            setSearchSubmitted(!searchSubmitted);
        } catch (error) {
            console.log(error);
        }
    };

    const submit = async () => {
        try {
            const res = await fetch("/api/user/friends/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: search }),
                credentials: "include",
            });

            const result = await res.json();
            setSearch("");
            alert(result.message);
            setSearchSubmitted(!searchSubmitted);
        } catch (error) {
            console.log(error);
        }
    };

    if (loading) {
        return (<Loading />);
    }

    if (!user) {
        return (<NotLoggedIn/>);
    }

    return (
        <div className="flex bg-gradient-to-b from-black via-blue-950 to-black text-white h-screen">
            <div className="flex w-4/12 flex-col">
                <h1 className="border-b-2 border-white">Your Friends</h1>
                <div className="flex flex-col">
                    {friends?.map((friend, index) => (
                        <div
                            key={index}
                            className="flex border-b-2 border-white w-full pt-2 pb-2"
                        >
                            <p>{friend}</p>
                            <button
                                className="ml-auto"
                                onClick={() => unfollow(friend)}
                            >
                                Unfollow
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex w-8/12 justify-center border-l-2 border-white h-screen">
                <div className="flex flex-col h-2/3 items-center justify-center">
                    <h1 className=" text-2xl">Add New Friend:</h1>
                    <div>
                        <input
                            type="text"
                            value={search}
                            placeholder="Search Friends"
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-0 rounded-lg pl-2 text-black"
                        />
                        <button
                            onClick={submit}
                            className="ml-2 border-2 border-white px-1 rounded-lg"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
