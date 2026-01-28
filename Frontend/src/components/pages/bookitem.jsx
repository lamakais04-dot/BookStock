import React from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/BookItem.css";
import Favorites from "../services/favorites";
export default function BookItem({ book }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };
  const handleLike = () =>{
    Favorites.add(book.id)
  }

  return (
    <div className="book-card">
      <div className="book-image" onClick={handleClick}>
        <img src={book.image} alt={book.title} className="book-image" />
      </div>

      <h3 className="book-title" onClick={handleClick}>{book.title}</h3>

      <p className="book-meta">{book.pages} עמודים</p>

      <div className="book-actions">
        <button className="borrow-btn">השאל ספר</button>
        <span onClick={handleLike} className="heart">♡</span>
      </div>
    </div>
  );
}
