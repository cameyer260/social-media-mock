"use client";

import { createContext, useState, useEffect, useContext } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const[user, setUser] = useState(null);
    const[loading, setLoading] = useState(true);

    useEffect(() => {
        // here is where we will fetch the user's email, name, profile pic, username, etc
        async function fetchData() {
            const res = await fetch("/api/user/get");

            const result = await res.json();
            console.log(result);
            setUser(result.user);
        }

        try {
            fetchData();
        } catch (error) {
            //alert(error.name);
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [])

    return (
        <GlobalContext.Provider value={{user, loading}}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);