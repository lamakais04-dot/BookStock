import axios from "axios";
const APIKEY = import.meta.env.VITE_API_KEY;


class Favorites {
    static async getFavorites() {
        const res = await axios.get("http://localhost:8000/api/favorites", {
            withCredentials: true,
            headers: { apiKey: APIKEY }
        });
        return res.data;
    }

    static async add(bookId) {
        await axios.post(
            `http://localhost:8000/api/favorites/${bookId}`,
            {},
            {
                withCredentials: true,
                headers: { apiKey: APIKEY }
            });
    }

    static async remove(bookId) {
        await axios.delete(
            `http://localhost:8000/api/favorites/${bookId}`,
            {
                withCredentials: true,
                headers: { apiKey: APIKEY }
            });
    }
}

export default Favorites;
