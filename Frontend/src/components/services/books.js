import axios from "axios";

class Books {
    static async getBooks(
        page = 1,
        limit = 10,
        categoryId = null,
        ageGroupId = null
    ) {
        const res = await axios.get("http://localhost:8000/api/book", {
            params: {
                page,
                limit,
                category_id: categoryId,
                age_group_id: ageGroupId   
            },
            withCredentials: true,
            headers: { apiKey: "123456789apikeysecure" }
        });

        return res.data;
    }

    static async getRandomBooks(limit = 10) {
        const res = await axios.get(
            "http://localhost:8000/api/book/random/limit",
            {
                params: { limit },
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            }
        );
        return res.data;
    }

    static async getBookById(id) {
        const res = await axios.get(
            `http://localhost:8000/api/book/${id}`,
            {
                withCredentials: true,
                headers: { apiKey: "123456789apikeysecure" }
            }
        );
        return res.data;
    }
}

export default Books;
