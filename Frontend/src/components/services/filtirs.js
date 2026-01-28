import axios from "axios";

class Filters {
    static async getAgeGroups() {
        const res = await axios.get("http://localhost:8000/api/age",
            {
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            }
        );
        return res.data;
    }

    static async getCategories() {
        const res = await axios.get("http://localhost:8000/api/category",
            {
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            }
        );
        return res.data;
    }
}

export default Filters;
