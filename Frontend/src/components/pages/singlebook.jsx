import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Books from "../services/books";
import '../csspages/singleBook.css';

export default function SingleBook() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        const data = await Books.getBookById(id);
        setBook(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchBook();
  }, [id]);

  if (!book) return <p>Loading...</p>;

  return (
    <div className="single-book">
      <div className="book-image">
        <img src={book.image} alt={book.title} />
      </div>

      <div className="book-details">
        <h1 className="book-title">{book.title}</h1>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Summary:</strong> {book.summary}</p>
        <p><strong>Pages:</strong> {book.pages}</p>
        <p><strong>Quantity in stock:</strong> {book.quantity}</p>
        <p><strong>Category ID:</strong> {book.categoryid}</p>
        <p><strong>Age Range ID:</strong> {book.agesid}</p>
      </div>
    </div>
  );
}
