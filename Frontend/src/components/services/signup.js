import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

class SignupClass {
  static async signup(data) {
    const res = await axios.post(
      `${API_BASE_URL}/api/auth/signup`,
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
