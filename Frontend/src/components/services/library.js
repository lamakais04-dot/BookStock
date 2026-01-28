import axios from "axios";

class Library {
  static async borrowBook(bookId) {
    const res = await axios.post(
      `http://localhost:8000/api/library/borrow/${bookId}`,
      {},
      { withCredentials: true }
    );
    return res.data;
  }
}

export default Library;
