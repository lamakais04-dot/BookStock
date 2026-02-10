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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Same password validation like Signup:
  // min 8 chars, starts with uppercase letter, at least 1 special char
  const validatePassword = (v) => {
    if (!v || v.length < 8) return "הסיסמה חייבת להכיל לפחות 8 תווים";
    if (!/^[A-Z]/.test(v)) return "הסיסמה חייבת להתחיל באות גדולה באנגלית (A-Z)";
    if (!/[^A-Za-z0-9]/.test(v)) return "הסיסמה חייבת להכיל לפחות תו מיוחד אחד (לדוגמה: !@#)";
    return true;
  };

  // ===== Validators =====
  const validators = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "אימייל לא תקין",
    password: validatePassword
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
      setIsSubmitting(true);
      await LoginClass.handleSubmit(email, password);
      await fetchUser();

      setShowSuccess(true);
      setEmail("");
      setPassword("");
      setErrors({});

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1400);
    } catch {
      setErrors({ general: "אימייל או סיסמה שגויים" });
      setShowSuccess(false);
    } finally {
      setIsSubmitting(false);
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
        {errors.general && <div className="login-alert error">❌ {errors.general}</div>}

        {showSuccess && (
          <div className="login-alert success">✔ התחברת בהצלחה! את/ה מועבר/ת לאפליקציה...</div>
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
                const v = e.target.value;
                setEmail(v);

                const valid = validators.email(v);
                setErrors((prev) => ({
                  ...prev,
                  email: valid === true ? "" : valid,
                  general: ""
                }));
              }}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">סיסמה</label>
            <input
              className="login-input"
              type="password"
              placeholder="לדוגמה: Abcdef!1"
              value={password}
              onChange={(e) => {
                const v = e.target.value;
                setPassword(v);

                const valid = validators.password(v);
                setErrors((prev) => ({
                  ...prev,
                  password: valid === true ? "" : valid,
                  general: ""
                }));
              }}
            />

            <small style={{ display: "block", marginTop: "6px", opacity: 0.8 }}>
              מינימום 8 תווים, מתחיל באות גדולה באנגלית, ולפחות תו מיוחד אחד
            </small>

            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "מתחבר..." : "התחבר"}
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
