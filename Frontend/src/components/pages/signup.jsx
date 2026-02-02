import React, { useState } from "react";
import SignupClass from "../services/signup";
import "../csspages/signup.css";

export default function Signup() {
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

  const validators = {
    firstname: v => v.length > 1 || "שם פרטי קצר מדי",
    lastname: v => v.length > 1 || "שם משפחה קצר מדי",
    birthdate: v => (v && v <= MAX_BIRTHDATE) || "שנת לידה חייבת להיות עד 2015",
    gender: v => v !== "" || "חובה לבחור מגדר",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "אימייל לא תקין",
    password: v => v.length >= 6 || "הסיסמה חייבת להכיל לפחות 6 תווים",
    phonenumber: v => /^\d{10}$/.test(v) || "מספר טלפון חייב להכיל 10 ספרות",
    address: v => v.length > 3 || "כתובת קצרה מדי"
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData({ ...formData, image: files[0] || null });
      return;
    }

    let newValue = value;
    if (name === "phonenumber") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData({ ...formData, [name]: newValue });

    if (validators[name]) {
      const valid = validators[name](newValue);
      setErrors({ ...errors, [name]: valid === true ? "" : valid });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(validators).forEach(field => {
      const valid = validators[field](formData[field]);
      if (valid !== true) newErrors[field] = valid;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          data.append(key, value);
        }
      });

      await SignupClass.handleSubmit(data);
      setShowSuccess(true);
      setFormData(initialState);
      setErrors({});
      setTimeout(() => setShowSuccess(false), 4000);
    } catch {
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
        {showSuccess && <div className="signup-alert success">✔ נרשמת בהצלחה!</div>}

        <form className="signup-form" onSubmit={handleSubmit}>

          {/* פרטים */}
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">שם פרטי</label>
              <input className="signup-input" name="firstname" value={formData.firstname} onChange={handleChange} />
              {errors.firstname && <span className="error-text">{errors.firstname}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">שם משפחה</label>
              <input className="signup-input" name="lastname" value={formData.lastname} onChange={handleChange} />
              {errors.lastname && <span className="error-text">{errors.lastname}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">תאריך לידה</label>
              <input type="date" className="signup-input" name="birthdate" max={MAX_BIRTHDATE} value={formData.birthdate} onChange={handleChange} />
              {errors.birthdate && <span className="error-text">{errors.birthdate}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">מגדר</label>
              <select className="signup-select" name="gender" value={formData.gender} onChange={handleChange}>
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
            <input className="signup-input" name="address" value={formData.address} onChange={handleChange} />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">אימייל</label>
              <input className="signup-input" type="email" name="email" value={formData.email} onChange={handleChange} />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">טלפון</label>
              <input className="signup-input" name="phonenumber" value={formData.phonenumber} onChange={handleChange} />
              {errors.phonenumber && <span className="error-text">{errors.phonenumber}</span>}
            </div>
          </div>

          <div className="input-group full-width">
            <label className="input-label">סיסמה</label>
            <input className="signup-input" type="password" name="password" value={formData.password} onChange={handleChange} />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* ===== IMAGE – LAST STEP ===== */}
          <div className="input-group full-width">
            <label className="input-label">תמונת פרופיל (אופציונלי)</label>
            <label className="signup-image-upload">
              <span className="upload-icon">📷</span>
              <span className="upload-text">
                לחצ/י להעלאת תמונה
                <small>אופציונלי</small>
              </span>
              <input type="file" name="image" accept="image/*" hidden onChange={handleChange} />
            </label>
          </div>

          <button className="signup-button" type="submit">הירשם עכשיו</button>
        </form>

        <div className="signup-footer">
          כבר יש לך חשבון? <a href="/login" className="signup-link">התחבר</a>
        </div>
      </div>
    </div>
  );
}
