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
        imageurl: ""
    };

    const [formData, setFormData] = useState(initialState);
    const [showAlert, setShowAlert] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await SignupClass.handleSubmit(formData);
            setShowAlert(true);
            setFormData(initialState);

            // סגירה אוטומטית אחרי 4 שניות
            setTimeout(() => setShowAlert(false), 4000);
        } catch (err) {
            console.error(err);
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

                {showAlert && (
                    <div className="signup-alert">
                        <strong>🎉 נרשמת בהצלחה!</strong>
                        <div>אפשר להתחבר לחשבון</div>
                    </div>
                )}

                <form className="signup-form" onSubmit={handleSubmit}>
                    {/* כל הטופס שלך – לא שיניתי כלום */}
                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">שם פרטי</label>
                            <input className="signup-input" name="firstname" value={formData.firstname} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">שם משפחה</label>
                            <input className="signup-input" name="lastname" value={formData.lastname} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">תאריך לידה</label>
                            <input className="signup-input" type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">מגדר</label>
                            <select className="signup-select" name="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="">בחר מגדר</option>
                                <option value="זכר">זכר</option>
                                <option value="נקבה">נקבה</option>
                                <option value="אחר">אחר</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group full-width">
                        <label className="input-label">כתובת</label>
                        <input className="signup-input" name="address" value={formData.address} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">אימייל</label>
                            <input className="signup-input" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">מספר טלפון</label>
                            <input className="signup-input" name="phonenumber" value={formData.phonenumber} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group full-width">
                        <label className="input-label">סיסמה</label>
                        <input className="signup-input" type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
                    </div>

                    <button className="signup-button" type="submit">
                        הירשם עכשיו
                    </button>
                </form>

                <div className="signup-footer">
                    כבר יש לך חשבון? <a href="/login" className="signup-link">התחבר</a>
                </div>
            </div>
        </div>
    );
}
