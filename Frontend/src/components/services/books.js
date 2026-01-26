import axios from 'axios'

class Books {
    static async getBooks() {
        const res = await axios.get("http://localhost:8000/api/book", {
            withCredentials: true,
            headers: { apiKey: "123456789apikeysecure" }
        })
        return res.data
    }
}


export default Books