// services/books.js
import axios from "axios";
const APIKEY = import.meta.env.VITE_API_KEY;


const BASE_URL = "http://localhost:8000/api/book";

class Books {
  static async getBooks(
    page = 1,
    limit = 8,
    categoryId = null,
    ageGroupId = null,
    search = ""
  ) {
    const res = await axios.get(BASE_URL, {
      withCredentials: true,
      params: {
        page,
        limit,
        category_id: categoryId,
        age_group_id: ageGroupId,
        search: search || undefined,
      },
      headers: { apiKey: APIKEY },
    });
    return res.data;
  }

  static async getBookById(id) {
    const res = await axios.get(`${BASE_URL}/${id}`, {
      withCredentials: true,
      headers: { apiKey: APIKEY },
    });
    return res.data;
  }

  static async getRandomBooks(limit = 10) {
    const res = await axios.get(`${BASE_URL}/random/limit`, {
      params: { limit },
      withCredentials: true,
      headers: { apiKey:APIKEY },
    });
    return res.data;
  }

  static async addBook(data) {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("summary", data.summary);
    formData.append("author", data.author);
    formData.append("quantity", data.quantity);
    formData.append("pages", data.pages);
    formData.append("categoryid", data.categoryid);
    formData.append("agesid", data.agesid);

    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }

    const res = await axios.post(BASE_URL, formData, {
      withCredentials: true,
      headers: { apiKey: APIKEY },
    });

    return res.data;
  }

  static async updateBook(id, data) {
    const formData = new FormData();

    if (data.title !== undefined) formData.append("title", data.title);
    if (data.summary !== undefined) formData.append("summary", data.summary);
    if (data.author !== undefined) formData.append("author", data.author);
    if (data.quantity !== undefined) formData.append("quantity", data.quantity);
    if (data.pages !== undefined) formData.append("pages", data.pages);
    if (data.categoryid !== undefined)
      formData.append("categoryid", data.categoryid);
    if (data.agesid !== undefined) formData.append("agesid", data.agesid);

    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }

    const res = await axios.put(`${BASE_URL}/${id}`, formData, {
      withCredentials: true,
      headers: { apiKey:APIKEY },
    });

    return res.data;
  }

  static async deleteBook(id) {
    await axios.delete(`${BASE_URL}/${id}`, {
      withCredentials: true,
      headers: { apiKey:APIKEY },
    });
  }
}

export default Books;
