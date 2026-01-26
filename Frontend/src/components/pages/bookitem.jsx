import React from "react"
import "../csspages/BookItem.css"

export default function BookItem({ book }) {
  return (
    <div className="book-card">
      <div className="book-image">
      </div>

      <h3 className="book-title">{book.title}</h3>

      <p className="book-meta">
        {book.pages} עמודים
      </p>

      <div className="book-actions">
        <button className="borrow-btn">השאל ספר</button>
        <span className="heart">♡</span>
      </div>
    </div>
  )
}
