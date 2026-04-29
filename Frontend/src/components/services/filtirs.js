import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

class Filters {
    static async getAgeGroups() {
        const res = await axios.get(`${API_BASE_URL}/api/age`,
            {
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            }
        );
        return res.data;
    }

    static async getCategories() {
        const res = await axios.get(`${API_BASE_URL}/api/category`,
            {
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            }
        );
        return res.data;
    }
}

export default Filters;
