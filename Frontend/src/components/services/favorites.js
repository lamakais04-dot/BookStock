import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

class Favorites {
    static async getFavorites() {
        const res = await axios.get(`${API_BASE_URL}/api/favorites`, {
            withCredentials: true,
            headers: { apiKey: "123456789apikeysecure" }
        });
        return res.data;
    }

    static async add(bookId) {
        await axios.post(
            `${API_BASE_URL}/api/favorites/${bookId}`,
            {},
            {
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            });
    }

    static async remove(bookId) {
        await axios.delete(
            `${API_BASE_URL}/api/favorites/${bookId}`,
            {
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            });
    }
}

export default Favorites;
