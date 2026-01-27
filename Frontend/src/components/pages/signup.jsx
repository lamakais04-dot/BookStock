import React, { useState } from "react";
import SignupClass from "../services/signup";
import '../csspages/signup.css';

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
    }

    const [formData, setFormData] = useState(initialState)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        SignupClass.handleSubmit(formData)
        setFormData(initialState)
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <div className="signup-icon">📚</div>
                    <h1 className="signup-title">הצטרף אלינו</h1>
                    <p className="signup-subtitle">צור חשבון חדש בספרייה</p>
                </div>

                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">שם פרטי</label>
                            <input
                                className="signup-input"
                                name="firstname"
                                placeholder="שם פרטי"
                                value={formData.firstname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">שם משפחה</label>
                            <input
                                className="signup-input"
                                name="lastname"
                                placeholder="שם משפחה"
                                value={formData.lastname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">תאריך לידה</label>
                            <input
                                className="signup-input"
                                type="date"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">מגדר</label>
                            <select
                                className="signup-select"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">בחר מגדר</option>
                                <option value="זכר">זכר</option>
                                <option value="נקבה">נקבה</option>
                                <option value="אחר">אחר</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group full-width">
                        <label className="input-label">כתובת</label>
                        <input
                            className="signup-input"
                            name="address"
                            placeholder="רחוב, עיר, מיקוד"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">אימייל</label>
                            <input
                                className="signup-input"
                                type="email"
                                name="email"
                                placeholder="example@mail.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">מספר טלפון</label>
                            <input
                                className="signup-input"
                                name="phonenumber"
                                placeholder="05X-XXXXXXX"
                                value={formData.phonenumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group full-width">
                        <label className="input-label">סיסמה</label>
                        <input
                            className="signup-input"
                            type="password"
                            name="password"
                            placeholder="בחר סיסמה חזקה"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="input-group full-width">
                        <label className="input-label">תמונת פרופיל (אופציונלי)</label>
                        <input
                            className="signup-file-input"
                            name="imageurl"
                            placeholder="בחר תמונה"
                            value={formData.imageurl}
                            onChange={handleChange}
                            type="file"
                            accept="image/*"
                        />
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