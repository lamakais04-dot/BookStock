import React from "react";
import "../csspages/homePage.css";
import libraryBg from "../../../imageLibrary.png"; // שים כאן את התמונה

const HomePage = () => {
  return (
    <div
      className="home-page"
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
    </div>
  );
};

export default HomePage;
