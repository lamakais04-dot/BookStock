import React, { useState } from "react";
import LoginClass from "../services/login.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../csspages/login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    // ===== Validators =====
    const validators = {
        email: (v) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "אימייל לא תקין",

        password: (v) =>
            v.length >= 6 || "הסיסמה חייבת להכיל לפחות 6 תווים"
    };

    // ===== Handle Submit =====
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        const emailValid = validators.email(email);
        if (emailValid !== true) newErrors.email = emailValid;

        const passwordValid = validators.password(password);
        if (passwordValid !== true) newErrors.password = passwordValid;

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            await LoginClass.handleSubmit(email, password);
            await fetchUser();

            setShowSuccess(true);
            setEmail("");
            setPassword("");
            setErrors({});

            // אופציונלי: רידיירקט אחרי 2 שניות
            setTimeout(() => {
                navigate("/");
            }, 2000);

        } catch {
            setErrors({ general: "אימייל או סיסמה שגויים" });
            setShowSuccess(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">📚</div>
                    <h1 className="login-title">ברוכים השבים</h1>
                    <p className="login-subtitle">התחבר לחשבון שלך</p>
                </div>

                {/* ===== ALERTS ===== */}
                {errors.general && (
                    <div className="login-alert error">
                        ❌ {errors.general}
                    </div>
                )}

                {showSuccess && (
                    <div className="login-alert success">
                        ✔ התחברת בהצלחה! מועבר לאתר...
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">אימייל</label>
                        <input
                            className="login-input"
                            type="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                const valid = validators.email(e.target.value);
                                setErrors({
                                    ...errors,
                                    email: valid === true ? "" : valid
                                });
                            }}
                        />
                        {errors.email && (
                            <span className="error-text">{errors.email}</span>
                        )}
                    </div>

                    <div className="input-group">
                        <label className="input-label">סיסמה</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder="לפחות 6 תווים"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                const valid = validators.password(e.target.value);
                                setErrors({
                                    ...errors,
                                    password: valid === true ? "" : valid
                                });
                            }}
                        />
                        {errors.password && (
                            <span className="error-text">{errors.password}</span>
                        )}
                    </div>

                    <button className="login-button" type="submit">
                        התחבר
                    </button>
                </form>

                <div className="login-footer">
                    עדיין אין לך חשבון?{" "}
                    <a href="/signup" className="login-link">
                        הירשם עכשיו
                    </a>
                </div>
            </div>
        </div>
    );
}
