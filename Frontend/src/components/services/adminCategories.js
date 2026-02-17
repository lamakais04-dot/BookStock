// services/adminCategories.js
import axios from "axios";
const APIKEY = import.meta.env.VITE_API_KEY;


const BASE = "http://localhost:8000/admin/categories";

class AdminCategories {
    static async getAll() {
        const res = await axios.get(BASE, {
            withCredentials: true, headers: { apiKey: APIKEY }
        });
        return res.data;
    }

    static async add(name) {
        return axios.post(
            BASE,
            { name },
            {
                withCredentials: true, headers: { apiKey: APIKEY }
            }
        );
    }

    static async update(id, name) {
        return axios.put(
            `${BASE}/${id}`,
            { name },
            {
                withCredentials: true, headers: { apiKey: APIKEY}
            }
        );
    }

    static async remove(id) {
        return axios.delete(`${BASE}/${id}`, {
            withCredentials: true, headers: { apiKey: APIKEY }

        });
    }
}

export default AdminCategories;
