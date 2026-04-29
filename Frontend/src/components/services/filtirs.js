import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

class Filters {
    static async getAgeGroups() {
        const res = await axios.get(`${API_BASE_URL}/api/age`,
            {
                withCredentials: true,
                headers: { apiKey: APIKEY }
            }
        );
        return res.data;
    }

    static async getCategories() {
        const res = await axios.get(`${API_BASE_URL}/api/category`,
            {
                withCredentials: true,
                headers: { apiKey: APIKEY }
            }
        );
        return res.data;
    }
}

export default Filters;
