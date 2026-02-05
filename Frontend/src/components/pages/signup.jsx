import React, { useState } from "react";
import SignupClass from "../services/signup";
import "../csspages/signup.css";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const initialState = {
    firstname: "",
    lastname: "",
    birthdate: "",
    address: "",
    gender: "",
    email: "",
    password: "",
    phonenumber: "",
    image: null
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const MAX_BIRTHDATE = "2015-12-31";

  // ✅ Password validation like the image:
  // min 8 chars, starts with uppercase letter, at least 1 special char
  const validatePassword = (v) => {
    if (!v || v.length < 8) return "הסיסמה חייבת להכיל לפחות 8 תווים";
    if (!/^[A-Z]/.test(v)) return "הסיסמה חייבת להתחיל באות גדולה באנגלית (A-Z)";
    if (!/[^A-Za-z0-9]/.test(v)) return "הסיסמה חייבת להכיל לפחות תו מיוחד אחד (לדוגמה: !@#)";
    return true;
  };

  const validators = {
    firstname: (v) => v.length > 1 || "שם פרטי קצר מדי",
    lastname: (v) => v.length > 1 || "שם משפחה קצר מדי",
    birthdate: (v) => (v && v <= MAX_BIRTHDATE) || "שנת לידה חייבת להיות עד 2015",
    gender: (v) => v !== "" || "חובה לבחור מגדר",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "אימייל לא תקין",
    password: validatePassword, // ✅ updated
    phonenumber: (v) => /^\d{10}$/.test(v) || "מספר טלפון חייב להכיל 10 ספרות",
    address: (v) => v.length > 3 || "כתובת קצרה מדי"
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    let newValue = value;
    if (name === "phonenumber") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (validators[name]) {
      const valid = validators[name](newValue);
      setErrors((prev) => ({ ...prev, [name]: valid === true ? "" : valid }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      const valid = validators[field](formData[field]);
      if (valid !== true) newErrors[field] = valid;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const { ...signupPayload } = formData;

      const finalPayload = {
        ...signupPayload
      };

      await SignupClass.signup(finalPayload);

      setShowSuccess(true);
      setErrors({});

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setErrors({ general: "הרשמה נכשלה, נסה שוב" });
      setShowSuccess(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="signup-icon">📚</div>
          <h1 className="signup-title">הצטרף אלינו</h1>
          <p className="signup-subtitle">צור חשבון חדש בספרייה</p>
        </div>

        {errors.general && <div className="signup-alert error">{errors.general}</div>}
        {showSuccess && (
          <div className="signup-alert success">✔ נרשמת בהצלחה! הינך מועבר לדף התחברות...</div>
        )}

        <form className="signup-form" onSubmit={handleSubmit}>
          {/* פרטים */}
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">שם פרטי</label>
              <input
                className="signup-input"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
              />
              {errors.firstname && <span className="error-text">{errors.firstname}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">שם משפחה</label>
              <input
                className="signup-input"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
              />
              {errors.lastname && <span className="error-text">{errors.lastname}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">תאריך לידה</label>
              <input
                type="date"
                className="signup-input"
                name="birthdate"
                max={MAX_BIRTHDATE}
                value={formData.birthdate}
                onChange={handleChange}
              />
              {errors.birthdate && <span className="error-text">{errors.birthdate}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">מגדר</label>
              <select
                className="signup-select"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">בחר מגדר</option>
                <option value="זכר">זכר</option>
                <option value="נקבה">נקבה</option>
                <option value="אחר">אחר</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>
          </div>

          <div className="input-group full-width">
            <label className="input-label">כתובת</label>
            <input
              className="signup-input"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">אימייל</label>
              <input
                className="signup-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">טלפון</label>
              <input
                className="signup-input"
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleChange}
              />
              {errors.phonenumber && <span className="error-text">{errors.phonenumber}</span>}
            </div>
          </div>

          <div className="input-group full-width">
            <label className="input-label">סיסמה</label>
            <input
              className="signup-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="לדוגמה: Abcdef!1"
            />
            {/* hint like the requirements */}
            <small style={{ display: "block", marginTop: "6px", opacity: 0.8 }}>
              מינימום 8 תווים, מתחיל באות גדולה באנגלית, ולפחות תו מיוחד אחד
            </small>

            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button className="signup-button" type="submit">
            הירשם עכשיו
          </button>
        </form>

        <div className="signup-footer">
          כבר יש לך חשבון?{" "}
          <a href="/login" className="signup-link">
            התחבר
          </a>
        </div>
      </div>
    </div>
  );
}
