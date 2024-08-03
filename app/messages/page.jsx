"use client";

import { useState, useEffect } from "react";
import NewMessageIcon from "../components/newMessageIcon";
import { useGlobalContext } from "../context/GlobalContext.js";
import Loading from "../components/loading.js";
import NotLoggedIn from "../components/notLoggedIn.js";

export default function MessagesPage() {
    const [newMessagePopup, setNewMessagePopup] = useState(false);
    const [searchMessages, setSearchMessages] = useState("");
    const [searchNewMessage, setSearchNewMessage] = useState("");

    const [messages, setMessages] = useState([]); //
    const [friends, setFriends] = useState([]);
    // useState variable used to determine what chat will show on the right side of the screen if any
    // if this is null, no chat is opened so we just show the div with the create new message button
    // if this is not null, it is a messageLog object, which we render on the screen as messages between our user and another user
    const [currentChat, setCurrentChat] = useState(null);

    const [friendsAfterSearch, setFriendsAfterSearch] = useState([]); // friends that will be displayed in the new message popup based on the search

    const [triggerFetch, setTriggerFetch] = useState(false);

    const [currentMessage, setCurrentMessage] = useState("");

    const { user, loading } = useGlobalContext();

    useEffect(() => {
        try {
            const execute = async () => {
                // FETCH FRIENDS
                const res = await fetch("/api/user/friends", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                const result = await res.json();
                setFriends(result.friends);
                setFriendsAfterSearch(result.friends);

                // THEN FETCH MESSAGES
                const res2 = await fetch("/api/user/messageLog/retrieve", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                const result2 = await res2.json();
                console.log(result2);
                setMessages(result2.messages);
            };

            execute();
        } catch (error) {
            // alert(error.name);
            console.log(error);
        }
    }, [triggerFetch]);

    useEffect(() => {
        setFriendsAfterSearch(
            friends?.filter((friend) => friend.indexOf(searchNewMessage) !== -1)
        );
    }, [friends, searchNewMessage]);

    // Update currentChat when messages are updated
    useEffect(() => {
        if (currentChat) {
            const updatedChat = messages.find(
                (log) => log.toUsername === currentChat.toUsername
            );
            setCurrentChat(updatedChat || null);
        }
    }, [messages]);

    const createNewMessageLog = async (friend) => {
        try {
            // creates new messageLog
            const res = await fetch("/api/user/messageLog/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: friend }),
                credentials: "include",
            });
            if (res.status !== 200) {
                alert(result.message);
            }
            const result = await res.json();
            setTriggerFetch(!triggerFetch);
        } catch (error) {
            alert(error.name);
            console.log(error);
        }
    };

    const sendMessage = async () => {
        // make patch request to /api/messageLog/newMessage
        console.log(currentChat);
        const message = {
            content: currentMessage,
            // no from var, that will be determined on the server
            to: currentChat.toUsername,
        };

        const res = await fetch("/api/user/messageLog/newMessage", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message),
            credentials: "include",
        });

        const result = await res.json();

        console.log(result);

        // refetch messages
        setTriggerFetch(!triggerFetch);
    };

    if(loading) {
        return (<Loading />);
    }

    if (!user) {
        return (<NotLoggedIn/>);
    }

    return (
        <div className="flex">
            <div className="flex flex-col w-4/12 bg-gradient-to-b from-black via-blue-950 to-black text-white">
                <div className="flex flex-col">
                    <div className="flex border-b-2 border-white py-2">
                        <h3>Messages</h3>
                        <input
                            type="text"
                            value={searchMessages}
                            onChange={(e) => setSearchMessages(e.target.value)}
                            placeholder="Search Messages"
                            className="border-0 rounded-lg text-black pl-2 ml-2"
                        />
                    </div>
                    <div className="parent">
                        {messages?.map((messageLog, index) => (
                            <div
                                key={index}
                                className="border-b-2 border-white child w-full"
                            >
                                <button
                                    onClick={() => {
                                        if (currentChat === messageLog) {
                                            setCurrentChat(null);
                                        } else {
                                            setCurrentChat(messageLog);
                                        }
                                    }}
                                    className="child w-full h-full text-left"
                                >
                                    <p className="text-m pb-2 font-bold">
                                        {messageLog.toUsername}
                                    </p>
                                    {messageLog.messages[
                                        messageLog.messages.length - 1
                                    ] ? (
                                        <p className="text-s">
                                            {
                                                messageLog.messages[
                                                    messageLog.messages.length -
                                                        1
                                                ]?.content
                                            }
                                        </p>
                                    ) : (
                                        <p className="pb-3"></p>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setTriggerFetch(!triggerFetch)}>
                        refetch data
                    </button>
                    <button onClick={() => console.log(messages)}>
                        print messages
                    </button>
                </div>
            </div>
            {currentChat ? (
                <div className="flex flex-col w-8/12 bg-gradient-to-b from-black via-blue-950 to-black border-l-2 border-white text-white h-screen">
                    <div className="flex justify-center pb-2 border-b-2 border-white">
                        <h1>{currentChat.toUsername}</h1>
                    </div>
                    <div className="px-2">
                        {currentChat.messages.map((message, index) => (
                            <p
                                className={`bg-sky-400 w-fit max-w-full px-1 my-2 rounded-lg break-words ${
                                    message.from === currentChat.ownerUsername
                                        ? "ml-auto"
                                        : ""
                                }`}
                                key={index}
                            >
                                {message.content}
                            </p>
                        ))}
                    </div>
                    <div className="flex mt-auto pb-12 border-t-2 border-white">
                        <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            className="border-white rounded-lg pl-2 text-black mt-2 ml-2 w-10/12"
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-white text-black mt-2 ml-2 px-2 border-white rounded-lg"
                        >
                            Send Message
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center w-8/12 bg-gradient-to-b from-black via-blue-950 to-black border-l-2 border-white text-white">
                    <div className="flex flex-col items-center justify-center h-screen">
                        <h1>Create New Message</h1>
                        <button
                            onClick={() => setNewMessagePopup(!newMessagePopup)}
                        >
                            <NewMessageIcon />
                        </button>
                    </div>
                </div>
            )}
            {newMessagePopup && (
                <div className="absolute border-2 border-white rounded-2xl bg-black text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1/3 w-6/12">
                    <div className="flex py-1 border-b-2 border-white space-x-4">
                        <button
                            onClick={() => setNewMessagePopup(false)}
                            className="pl-2"
                        >
                            Exit
                        </button>
                        <h1>New Message</h1>
                        <input
                            type="text"
                            value={searchNewMessage}
                            onChange={(e) => {
                                setSearchNewMessage(e.target.value);
                            }}
                            placeholder="username"
                            className="rounded-xl pl-2 text-black"
                        />
                    </div>
                    <div>
                        {friendsAfterSearch?.map((friend, index) => (
                            <div
                                key={index}
                                className="border-b-2 border-white pl-2"
                            >
                                <button
                                    onClick={() => createNewMessageLog(friend)}
                                >
                                    {friend}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
