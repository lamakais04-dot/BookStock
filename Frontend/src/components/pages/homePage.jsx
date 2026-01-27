import React, { useEffect, useState } from "react";
import "../csspages/homePage.css";
import libraryBg from "../../../imageLibrary.png";
import BookItem from "./BookItem";
import Books from "../services/books";

const HomePage = () => {
  const [randomBooks, setRandomBooks] = useState([]);

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
            <button>חיפוש ספר</button>
            <button className="secondary">השאל ספר</button>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>ספרים שאולי תאהב/י</h2>

        <div className="books-scroll">
          {randomBooks.map((book) => (
            <BookItem key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
