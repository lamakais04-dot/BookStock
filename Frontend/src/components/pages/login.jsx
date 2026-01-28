import React, { useState } from 'react'
import LoginClass from '../services/login.js'
import '../csspages/login.css'
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';


export default function Login() {

    const navigate = useNavigate();
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { fetchUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault()
        await LoginClass.handleSubmit(email, password)
        await fetchUser();
        setEmail("")
        setPassword("")
        navigate("/")
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">📚</div>
                    <h1 className="login-title">ברוכים השבים</h1>
                    <p className="login-subtitle">התחבר לחשבון שלך</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">אימייל</label>
                        <input
                            className="login-input"
                            type="email"
                            placeholder="אימייל..."
                            value={email}
                            onChange={(e) => { setEmail(e.target.value) }}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">סיסמה</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder='סיסמה...'
                            value={password}
                            onChange={(e) => { setPassword(e.target.value) }}
                            required
                        />
                    </div>

                    <button className="login-button" type="submit">
                        התחבר
                    </button>
                </form>

                <div className="login-footer">
                    עדיין אין לך חשבון? <a href="/signup" className="login-link">הירשם עכשיו</a>
                </div>
            </div>
        </div>
    )
}