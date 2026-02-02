import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/homePage.css";
import libraryBg from "../../../imageLibrary.png";
import BookItem from "./BookItem";
import Books from "../services/books";
import { useAuth } from "../context/AuthContext"; // 🔹 Import Auth

const HomePage = () => {
  const [randomBooks, setRandomBooks] = useState([]);
  const navigate = useNavigate();
  
  // 🔹 Get user and check if admin
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const booksSectionRef = useRef(null);

  useEffect(() => {
    const fetchRandomBooks = async () => {
      try {
        const data = await Books.getRandomBooks(10);
        setRandomBooks(data);
      } catch (err) {
        console.error("Failed to load random books", err);
      }
    };

    fetchRandomBooks();
  }, []);

  const handleSearchClick = () => {
    navigate("/book");
  };

  const handleBorrowClick = () => {
    booksSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="home-container">
      <section
        className="hero"
        style={{ backgroundImage: `url(${libraryBg})` }}
      >
        <div className="overlay">
          <h1>ברוכים הבאים לספרייה השיתופית</h1>
          <p>
            מקום שבו ספרים עוברים מיד ליד, ידע לא עומד במקום,
            וסיפור טוב תמיד מחכה לך.
          </p>

          <div className="actions">
            <button onClick={handleSearchClick}>
              חיפוש ספר
            </button>

            <button
              className="secondary"
              onClick={handleBorrowClick}
            >
              השאל ספר
            </button>
          </div>
        </div>
      </section>

      <section className="section" ref={booksSectionRef}>
        <h2>ספרים שאולי תאהב/י</h2>

        <div className="books-scroll">
          {randomBooks.map((book) => (
            <BookItem 
              key={book.id} 
              book={book} 
              isAdmin={isAdmin} // 🔹 Pass the admin status here!
              setBooks={setRandomBooks} // 🔹 Pass setBooks so delete works here too
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;