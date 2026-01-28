import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Books from "../services/books";
import "../csspages/singleBook.css";

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

  if (!book) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="loading-text">טוען ספר...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="single-book-container">
      <div className="single-book">

        {/* IMAGE */}
        <div className="book-image-wrapper">
          <div className="book-image">
            <img src={book.image} alt={book.title} />
          </div>
        </div>

        {/* DETAILS */}
        <div className="book-details">
          <h1 className="book-title">{book.title}</h1>

          <p className="book-author">מאת {book.author}</p>

          <div className="book-summary">
            {book.summary}
          </div>

          <div className="book-info-grid">
            <div className="info-item">
              <span className="info-label">מספר עמודים</span>
              <span className="info-value">{book.pages}</span>
            </div>

            <div className="info-item">
              <span className="info-label">כמות במלאי</span>
              <span className="info-value">{book.quantity}</span>
            </div>

            <div className="info-item">
              <span className="info-label">קטגוריה</span>
              <span className="info-value">{book.categoryName || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">טווח גילאים</span>
              <span className="info-value">{book.ageRangeName || "—"}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="book-actions">
            <button className="borrow-button">
              השאלת ספר
            </button>

            <button className="favorite-button">
              <span className="favorite-icon">♡</span>
              הוספה למועדפים
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
