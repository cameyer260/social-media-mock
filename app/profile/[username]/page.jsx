"use client";

import { useGlobalContext } from "../../context/GlobalContext.js";
import { useEffect, useState } from "react";
import Loading from "../../components/loading.js";
import NotLoggedIn from "../../components/notLoggedIn.js";
import NewMessageIcon from "../../components/newMessageIcon.js";
import NewPostIcon from "../../components/newPostIcon.js";
import Link from "next/link";

export default function Page({ params }) {
    const { user, loading } = useGlobalContext();

    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    // use state variable used to determine what will be displayed on the left side of the screen
    // it can be default, ownPage, following, followers, post (it will be set to the post object)
    const [leftSide, setLeftSide] = useState("default");

    useEffect(() => {
        // fetch data about the user (name, following, etc...)
        const fetchData = async () => {
            const res = await fetch(`/api/user/get/${params.username}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const result = await res.json();
            if (result.data.isEditable) {
                setLeftSide("ownPage");
            }
            setData(result.data);
            if (res.status !== 200) {
                alert(result.message);
                setError(true);
            }
            console.log(result); // set useState variable to data on success

            // now fetch profile picture
        };

        try {
            fetchData();
        } catch (error) {
            //alert(error);
            console.log(error);
        }
    }, []);

    const startConvo = async () => {
        // makes post request to /api/user/messageLog/create, then forwards user to messages page if creation was successful
    }

    const createPost = async () => {
        // makes post request to posts api
    }

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <NotLoggedIn />;
    }

    if (error) {
        return (
            <div>
                {data.message}
            </div>
        )
    }
    return (
        <div className="flex bg-gradient-to-b from-black via-blue-950 to-black text-white h-screen w-screen">
            {leftSide === "default" && (
                <div className="flex w-4/12 items-center justify-center">
                    <button className="flex items-center justify-center flex-col" onClick={startConvo}>
                        <NewMessageIcon />
                        <p>Start a conversation?</p>
                    </button>
                </div>
            )}
            {leftSide === "ownPage" && (
                <div className="flex w-4/12 items-center justify-center">
                    <button className="flex items-center justify-center flex-col" onClick={createPost}>
                        <NewPostIcon />
                        <p>Create a new post?</p>
                    </button>
                </div>
            )}
            {leftSide === "following" && (
                <div className="flex w-4/12 flex-col">
                    {data.following.map((theirUsername) => 
                        <div className="border-b-2 border-white py-2 pl-2">
                            <Link href={`/profile/${theirUsername}`}>{theirUsername}</Link>
                        </div>
                    )}
                </div>
            )}
            {leftSide === "followers" && (
                <div className="flex w-4/12 flex-col">
                    {data.followers.map((theirUsername) => 
                        <div className="border-b-2 border-white py-2 pl-2">
                            <Link href={`/profile/${theirUsername}`}>{theirUsername}</Link>
                        </div>
                    )}
                </div>
            )}
            {leftSide === "post" && (
                <div className="flex w-4/12">
                    post goes inside here (use a useState to hold what post to display)
                </div>
            )}
            <div className="flex w-8/12 border-l-2 border-white h-screen">
                <h1>hello</h1>
            </div>
        </div>
    );
}
