import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/homePage.css";
import libraryBg from "../../../imageLibrary.png";
import BookItem from "./BookItem";
import Books from "../services/books";
import { useAuth } from "../context/AuthContext";
import { socket } from "../services/socket";

const HomePage = () => {
  const [randomBooks, setRandomBooks] = useState([]);
  const navigate = useNavigate();

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const booksSectionRef = useRef(null);

  const loadRandomBooks = useCallback(async () => {
    try {
      const data = await Books.getRandomBooks(10);
      setRandomBooks(data);
    } catch (err) {
      console.error("Failed to load random books", err);
    }
  }, []);

  useEffect(() => {
    loadRandomBooks();
  }, [loadRandomBooks]);

  // OPTIONAL: live refresh when catalog changes (NOT on borrow/return)
  useEffect(() => {
    function handleBooksChanged(payload) {
      // ignore events from current user
      if (payload?.userId && payload.userId === user?.id) return;

      // Only reload when books are created/updated/deleted.
      if (
        payload?.reason === "created" ||
        payload?.reason === "updated" ||
        payload?.reason === "deleted"
      ) {
        loadRandomBooks();
      }
      // BORROWED / RETURNED are ignored so UI stays local and no “reload”
    }

    socket.on("books_changed", handleBooksChanged);

    return () => {
      socket.off("books_changed", handleBooksChanged);
    };
  }, [loadRandomBooks, user?.id]);

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
            <button onClick={handleSearchClick}>חיפוש ספר</button>

            <button className="secondary" onClick={handleBorrowClick}>
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
              isAdmin={isAdmin}
              setBooks={setRandomBooks}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
