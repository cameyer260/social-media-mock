"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobalContext } from "../context/GlobalContext.js";
import Loading from "../components/loading.js";
import NotLoggedIn from "../components/notLoggedIn.js";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading } = useGlobalContext();

    useEffect(() => {
        router.push(`/profile/${user?.username}`);
    })

    if(!user) {
        return <NotLoggedIn />
    }
    if(loading) {
        return <Loading />
    }
}