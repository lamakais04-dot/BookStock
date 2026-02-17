import axios from "axios";
const APIKEY = import.meta.env.VITE_API_KEY;


class SignupClass {
  static async signup(data) {
    const res = await axios.post(
      "http://localhost:8000/api/auth/signup",
      data,
      {
        withCredentials: true,
        headers: {
          apiKey: APIKEY,
          "Content-Type": "application/json"
        }
      }
    );
    return res.data;
  }
}

export default SignupClass;
