"use client";

import { useGlobalContext } from "../../context/GlobalContext.js";
import { useEffect, useState } from "react";
import Loading from "../../components/loading.js";
import NotLoggedIn from "../../components/notLoggedIn.js";
import NewMessageIcon from "../../components/newMessageIcon.js";
import NewPostIcon from "../../components/newPostIcon.js";
import Link from "next/link";
import WhiteProfileIcon from "../../components/white_default_profile_pic.js";
import Image from "next/image.js";

export default function Page({ params }) {
    const { user, loading } = useGlobalContext();

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    // use state variable used to determine what will be displayed on the left side of the screen
    // it can be default, ownPage, following, followers, post (it will be set to the post object)
    const [leftSide, setLeftSide] = useState("default");

    const [profilePicUrl, setProfilePicUrl] = useState(null);

    // 3 use states for editing the profile picture, name, and bio
    // name and bio being true just turns thier tags into forms that can be edited then submitted
    // profile picture opens a pop up that allows the user to upload their file picture
    const [changeName, setChangeName] = useState(false);
    const [changeBio, setChangeBio] = useState(false);
    const [changeProfilePic, setChangeProfilePic] = useState(false);

    // values for the changeName and changeBio forms
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [bio, setBio] = useState("");

    // image file useState for uploading profile pic
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        // fetch data about the user (name, following, etc...)
        const fetchData = async () => {
            const res = await fetch(`/api/user/get/${params.username}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const result = await res.json();
            if (res.status !== 200) {
                setError(result.message);
            }
            if (result.data?.isEditable) {
                setLeftSide("ownPage");
            }
            setData(result.data);
            console.log(result); // set useState variable to data on success

            // now fetch profile picture
            const res2 = await fetch(
                `/api/user/profilePicture/${params.username}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );
            const result2 = await res2.json();
            console.log(result2);
            if (res2.status === 200) {
                setProfilePicUrl(result2.imgUrl);
            } // else we leave it null
        };

        try {
            fetchData();
        } catch (error) {
            //alert(error);
            console.log(error);
        }
    }, [changeName, changeBio, changeProfilePic]);

    const startConvo = async () => {
        // makes post request to /api/user/messageLog/create, then forwards user to messages page if creation was successful
    };

    const createPost = async () => {
        // makes post request to posts api
    };

    const submitName = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/user/name", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ first: first, last: last }),
            credentials: "include",
        });
        const result = await res.json();
        if (res.status !== 200) {
            console.log(result.message);
        }
        setChangeName(false);
    };

    const submitBio = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/user/bio", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bio: bio }),
            credentials: "include",
        });
        const result = await res.json();
        if (res.status !== 200) {
            console.log(result.message);
        }
        setChangeBio(false);
    };

    const submitProfilePicture = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', profilePicture);
        const res = await fetch("/api/user/profilePicture", {
            method: "POST",
            body: formData,
            credentials: "include",
        });
        const result = await res.json();
        if(res.status !== 200) {
            console.log(result.message);
        }
        setChangeProfilePic(false);
    };

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <NotLoggedIn />;
    }

    if (error) {
        return (
            <div className="flex bg-gradient-to-b from-black via-blue-950 to-black text-white h-screen w-screen items-center justify-center">
                <h1>{error}</h1>
            </div>
        );
    }
    return (
        <div className="flex bg-gradient-to-b from-black via-blue-950 to-black text-white h-screen w-screen">
            {leftSide === "default" && (
                <div className="flex w-4/12 items-center justify-center">
                    <button
                        className="flex items-center justify-center flex-col"
                        onClick={startConvo}
                    >
                        <NewMessageIcon />
                        <p>Start a conversation?</p>
                    </button>
                </div>
            )}
            {leftSide === "ownPage" && (
                <div className="flex w-4/12 items-center justify-center">
                    <button
                        className="flex items-center justify-center flex-col"
                        onClick={createPost}
                    >
                        <NewPostIcon />
                        <p>Create a new post?</p>
                    </button>
                </div>
            )}
            {leftSide === "following" && (
                <div className="flex w-4/12 flex-col">
                    {data.following.map((theirUsername) => (
                        <div className="border-b-2 border-white py-2 pl-2">
                            <Link href={`/profile/${theirUsername}`}>
                                {theirUsername}
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            {leftSide === "followers" && (
                <div className="flex w-4/12 flex-col">
                    {data.followers.map((theirUsername) => (
                        <div className="border-b-2 border-white py-2 pl-2">
                            <Link href={`/profile/${theirUsername}`}>
                                {theirUsername}
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            {leftSide === "post" && (
                <div className="flex w-4/12">
                    post goes inside here (use a useState to hold what post to
                    display)
                </div>
            )}

            {data?.isEditable ? (
                <div className="flex w-8/12 border-l-2 border-white h-screen flex-col">
                    <div>
                        <div className="flex flex-row space-x-20 pl-10 pt-5">
                            <div className="border-2 border-white rounded-full p-2">
                                <button
                                    onClick={() =>
                                        setChangeProfilePic(!changeProfilePic)
                                    }
                                >
                                    {profilePicUrl ? (
                                        <Image
                                            src={profilePicUrl}
                                            alt="profile-pic"
                                            height={75}
                                            width={75}
                                        ></Image>
                                    ) : (
                                        <WhiteProfileIcon />
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-col">
                                <h1>
                                    {changeName ? (
                                        <form
                                            onSubmit={submitName}
                                            className="flex flex-row space-x-2"
                                        >
                                            <input
                                                type="text"
                                                id="first"
                                                placeholder="First"
                                                onChange={(e) =>
                                                    setFirst(e.target.value)
                                                }
                                                value={first}
                                                className="border rounded-lg pl-2 text-black"
                                            />
                                            <input
                                                type="text"
                                                id="last"
                                                placeholder="Last"
                                                onChange={(e) =>
                                                    setLast(e.target.value)
                                                }
                                                value={last}
                                                className="border rounded-lg pl-2 text-black"
                                            />
                                            <button
                                                className=""
                                                onClick={() =>
                                                    setChangeName(!changeName)
                                                }
                                            >
                                                Exit
                                            </button>
                                            <button type="Submit" className="">
                                                Submit
                                            </button>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setChangeName(!changeName)
                                            }
                                        >
                                            {data?.name
                                                ? data.name
                                                : "Add a name to your profile?"}
                                        </button>
                                    )}
                                </h1>
                                <h1>{data?.username}</h1>
                                <h1>{data?.email}</h1>
                            </div>
                            <div className="flex flex-col">
                                <h1>x posts</h1>
                                <h1>
                                    {data?.followers
                                        ? data.followers.length
                                        : 0}{" "}
                                    followers
                                </h1>
                                <h1>
                                    {data?.following
                                        ? data.following.length
                                        : 0}{" "}
                                    following
                                </h1>
                            </div>
                        </div>
                        <div className="border-b-2 py-4 px-10">
                            {changeBio ? (
                                <form
                                    onSubmit={submitBio}
                                    className="flex flex-row space-x-2"
                                >
                                    <input
                                        type="text"
                                        id="bio"
                                        placeholder="bio"
                                        onChange={(e) => setBio(e.target.value)}
                                        value={bio}
                                        className="border rounded-lg px-2 text-black"
                                    />
                                    <button
                                        onClick={() => setChangeBio(!changeBio)}
                                    >
                                        Exit
                                    </button>
                                    <button type="Submit">Submit</button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setChangeBio(!changeBio)}
                                >
                                    {data?.bio ? (
                                        <h1>{data.bio}</h1>
                                    ) : (
                                        <h1>Add bio?</h1>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <h1>DIV HOLDING ALL THE POSTS</h1>
                        <div>POST NUMBER 1</div>
                    </div>
                    {changeProfilePic && (
                        <div className="absolute bg-black w-1/3 h-1/4 border-2 border-white rounded-lg top-1/3">
                            <form
                                onSubmit={submitProfilePicture}
                                className="flex flex-col w-full h-full"
                                encType="multipart/form-data"
                            >
                                <div className="flex flex-row w-full border-b-2 border-white px-2">
                                    <h1>Upload New Profile Picture</h1>
                                    <button
                                        className="ml-auto"
                                        onClick={() =>
                                            setChangeProfilePic(false)
                                        }
                                    >
                                        Exit
                                    </button>
                                </div>
                                <div className="p-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setProfilePicture(e.target.files[0])
                                        }
                                    />
                                    <button
                                        className="ml-auto border-2 border-white px-2 rounded-lg"
                                        type="submit"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex w-8/12 border-l-2 border-white h-screen flex-col">
                    <div>
                        <div className="flex flex-row space-x-20 pl-10 pt-5">
                            <div className="border-2 border-white rounded-full p-2">
                                {profilePicUrl ? (
                                    <Image
                                        src={profilePicUrl}
                                        alt="profile-pic"
                                        height={75}
                                        width={75}
                                    ></Image>
                                ) : (
                                    <WhiteProfileIcon />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <h1>
                                    {data?.name
                                        ? data.name
                                        : "No name on record."}
                                </h1>
                                <h1>{data?.username}</h1>
                                <h1>{data?.email}</h1>
                            </div>
                            <div className="flex flex-col">
                                <h1>x posts</h1>
                                <h1>
                                    {data?.followers
                                        ? data.followers.length
                                        : 0}{" "}
                                    followers
                                </h1>
                                <h1>
                                    {data?.following
                                        ? data.following.length
                                        : 0}{" "}
                                    following
                                </h1>
                            </div>
                        </div>
                        <div className="border-b-2 py-4 px-10">
                            {data?.bio ? <h1>{data.bio}</h1> : <h1></h1>}
                        </div>
                    </div>
                    <div>
                        <h1>DIV HOLDING ALL THE POSTS</h1>
                        <div>POST NUMBER 1</div>
                    </div>
                </div>
            )}
        </div>
    );
}
