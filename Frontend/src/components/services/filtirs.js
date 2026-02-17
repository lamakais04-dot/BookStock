import axios from "axios";
const APIKEY = import.meta.env.VITE_API_KEY;


class Filters {
    static async getAgeGroups() {
        const res = await axios.get("http://localhost:8000/api/age",
            {
                withCredentials: true,
                headers: { apiKey: APIKEY }
            }
        );
        return res.data;
    }

    static async getCategories() {
        const res = await axios.get("http://localhost:8000/api/category",
            {
                withCredentials: true,
                headers: { apiKey: APIKEY }
            }
        );
        return res.data;
    }
}

export default Filters;
