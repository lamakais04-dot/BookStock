import axios from "axios";

class SignupClass {
  static async signup(data) {
    const res = await axios.post(
      "http://localhost:8000/api/auth/signup",
      data,
      {
        withCredentials: true,
        headers: {
          apiKey: "123456789apikeysecure",
          "Content-Type": "application/json"
        }
      }
    );
    return res.data;
  }
}

export default SignupClass;
