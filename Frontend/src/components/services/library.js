import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

class Library {
    static async borrowBook(bookId) {
        const res = await axios.post(
            `${API_BASE_URL}/api/library/borrow/${bookId}`,
            {},
            { withCredentials: true, headers: { apiKey: APIKEY } }
        );
        console.log(res.data)
        return res.data;
    }

    static async returnBook(bookId) {
        const res = await axios.post(
            `${API_BASE_URL}/api/library/return/${bookId}`,
            {},
            { withCredentials: true, headers: { apiKey: APIKEY } }
        );
        return res.data;
    }

    static async getMyBooks() {
        const res = await axios.get(
            `${API_BASE_URL}/api/library/my-books`,
            {
                withCredentials: true,
                headers: { apiKey: APIKEY }
            }
        );
        return res.data;
    }

}

export default Library;
