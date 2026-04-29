import axios from "axios";
const APIKEY = import.meta.env.VITE_API_KEY;


class SignupClass {
  static async signup(data) {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/signup`,
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
