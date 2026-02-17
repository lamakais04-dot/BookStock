import axios from "axios";
const APIKEY = import.meta.env.VITE_API_KEY;


class Library {
    static async borrowBook(bookId) {
        const res = await axios.post(
            `http://localhost:8000/api/library/borrow/${bookId}`,
            {},
            { withCredentials: true, headers: { apiKey: APIKEY } }
        );
        console.log(res.data)
        return res.data;
    }

    static async returnBook(bookId) {
        const res = await axios.post(
            `http://localhost:8000/api/library/return/${bookId}`,
            {},
            { withCredentials: true, headers: { apiKey: APIKEY } }
        );
        return res.data;
    }

    static async getMyBooks() {
        const res = await axios.get(
            "http://localhost:8000/api/library/my-books",
            {
                withCredentials: true,
                headers: { apiKey: APIKEY }
            }
        );
        return res.data;
    }

}

export default Library;
