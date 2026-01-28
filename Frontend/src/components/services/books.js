import axios from "axios";

class Books {
  static async getBooks(
    page = 1,
    limit = 8,
    categoryId = null,
    ageGroupId = null,
    search = ""
  ) {
    const res = await axios.get("http://localhost:8000/api/book", {
      withCredentials: true,
      headers: { apiKey: "123456789apikeysecure" },
      params: {
        page,
        limit,
        category_id: categoryId,
        age_group_id: ageGroupId,
        search: search || undefined, 
      },
    });

    return res.data;
  }

  static async getBookById(id) {
    const res = await axios.get(
      `http://localhost:8000/api/book/${id}`,
      {
        withCredentials: true,
        headers: { apiKey: "123456789apikeysecure" },
      }
    );
    return res.data;
  }

  static async getRandomBooks(limit = 10) {
    const res = await axios.get(
      "http://localhost:8000/api/book/random/limit",
      {
        params: { limit },
        withCredentials: true,
        headers: { apiKey: "123456789apikeysecure" },
      }
    );
    return res.data;
  }
}

export default Books;
