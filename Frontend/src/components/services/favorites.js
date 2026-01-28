import axios from "axios";

class Favorites {
    static async getFavorites() {
        const res = await axios.get("http://localhost:8000/api/favorites", {
            withCredentials: true,
            headers: { apiKey: "123456789apikeysecure" }
        });
        return res.data;
    }

    static async add(bookId) {
        await axios.post(
            `http://localhost:8000/api/favorites/${bookId}`,
            {},
            {
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            });
    }

    static async remove(bookId) {
        await axios.delete(
            `http://localhost:8000/api/favorites/${bookId}`,
            {
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            });
    }
}

export default Favorites;
