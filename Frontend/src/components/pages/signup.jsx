import React, { useState } from "react";
import SignupClass from "../services/signup";

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

        setFormData(initialState )
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>

                <input
                    name="firstname"
                    placeholder="First Name"
                    value={formData.firstname}
                    onChange={handleChange}
                />

                <input
                    name="lastname"
                    placeholder="Last Name"
                    value={formData.lastname}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                />

                <input
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                />

                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                >
                    <option value="">Select Gender</option>
                    <option value="זכר">זכר</option>
                    <option value="נקבה">נקבה</option>
                    <option value="אחר">אחר</option>
                </select>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <input
                    name="phonenumber"
                    placeholder="Phone Number"
                    value={formData.phonenumber}
                    onChange={handleChange}
                />

                <input
                    name="imageurl"
                    placeholder="Image URL (optional)"
                    value={formData.imageurl}
                    onChange={handleChange}
                    type="file"
                />

                <button type="submit">התחבר</button>

            </form>
        </div>
    );
}
