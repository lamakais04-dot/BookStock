import React, { useEffect, useState } from "react";
import Favorites from "../services/favorites";
import Books from "../services/books";
import BookItem from "./BookItem";


export default function FavoritesPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const favs = await Favorites.getFavorites();
        const bookIds = favs.map(f => f.bookid);

        if (bookIds.length === 0) {
          setBooks([]);
          return;
        }

        const bookRequests = bookIds.map(id =>
          Books.getBookById(id)
        );

        const booksData = await Promise.all(bookRequests);
        setBooks(booksData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  if (loading) return <p>טוען מועדפים...</p>;

  return (
    <div className="books-grid">
      {books.length === 0 ? (
        <p>אין לך ספרים מועדפים עדיין ❤️</p>
      ) : (
        books.map(book => (
          <BookItem key={book.id} book={book} />
        ))
      )}
    </div>
  );
}
