import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)


    const fetchUser = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/auth/me", {
                withCredentials: true,
                headers: {
                    apiKey: "123456789apikeysecure"
                }
            })
            setUser(res.data)
            setIsAdmin(res.data?.role === "admin")
        } catch {
            setUser(null)
            setIsAdmin(false)
        } finally {
            setLoading(false)
        }

    }

    useEffect(() => { fetchUser() }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, fetchUser, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)