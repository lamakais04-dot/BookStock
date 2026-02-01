import axios from "axios";

const API = "http://localhost:8000/api/auth";

class LoginClass {

  // ===== Login =====
  static async handleSubmit(email, password) {
    const payload = { email, password };

    const res = await axios.post(`${API}/login`, payload, {
      withCredentials: true,
      headers: { apiKey: "123456789apikeysecure" }
    });

    return res.data;
  }

  // ===== Logout =====
  static async handleLogout() {
    await axios.post(`${API}/logout`, {}, {
      withCredentials: true,
      headers: { apiKey: "123456789apikeysecure" }
    });
  }

  // ===== Get Profile =====
  static async getProfile() {
    const res = await axios.get(`${API}/me`, {
      withCredentials: true,
      headers: { apiKey: "123456789apikeysecure" }
    });

    return res.data;
  }

  // ===== Upload Profile Image =====
  static async uploadImage(formData) {
    const res = await axios.post(
      `${API}/uploadImage`,
      formData,
      {
        withCredentials: true,
        headers: {
          apiKey: "123456789apikeysecure",
          "Content-Type": "multipart/form-data"
        }
      }
    );

    return res.data; // { image: "https://..." }
  }

  // ===== Update Profile Details =====
  static async updateProfile(profile) {
    const res = await axios.put(
      `${API}/update-profile`,
      {
        firstname: profile.firstname,
        lastname: profile.lastname,
        phonenumber: profile.phonenumber,
        address: profile.address
      },
      {
        withCredentials: true,
        headers: { apiKey: "123456789apikeysecure" }
      }
    );

    return res.data;
  }
}

export default LoginClass;
