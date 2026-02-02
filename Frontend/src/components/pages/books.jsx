import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import BookItem from "./BookItem";
import Modal from "./Modal";
import BookForm from "./BookForm";
import { useAuth } from "../context/AuthContext";

import "../csspages/books.css";
import "../csspages/filters.css";
import "../csspages/pagination.css";

export default function AllBooks() {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  const [categoryId, setCategoryId] = useState(null);
  const [ageGroupId, setAgeGroupId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editBook, setEditBook] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const booksPerPage = 10;
  const location = useLocation();
  const search =
    new URLSearchParams(location.search).get("search") || "";

  // ===== Fetch books =====
  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        const data = await Books.getBooks(
          currentPage,
          booksPerPage,
          categoryId,
          ageGroupId,
          search
        );
        setBooks(data?.books || []);
        setTotalPages(data?.totalPages || 1);
      } catch (err) {
        console.error(err);
        setBooks([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [currentPage, categoryId, ageGroupId, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, ageGroupId, search]);

  // ===== Load filters =====
  useEffect(() => {
    async function loadFilters() {
      try {
        setCategories(await Filters.getCategories());
        setAgeGroups(await Filters.getAgeGroups());
      } catch (err) {
        console.error(err);
      }
    }
    loadFilters();
  }, []);

  return (
    <>
      {/* ===== ADMIN ADD BUTTON ===== */}
      {isAdmin && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button onClick={() => setShowAddModal(true)}>
            ➕ הוסף ספר
          </button>
        </div>
      )}

      {/* ===== Age Filter ===== */}
      <div className="age-filter">
        {ageGroups.map(age => (
          <button
            key={age.id}
            className={`age-btn ${ageGroupId === age.id ? "active" : ""}`}
            onClick={() =>
              setAgeGroupId(ageGroupId === age.id ? null : age.id)
            }
          >
            <span className="star">★</span>
            {age.description}
          </button>
        ))}
      </div>

      {/* ===== Books grid ===== */}
      <div className="books-grid">
        {books.map(book => (
          <BookItem
            key={book.id}
            book={book}
            setBooks={setBooks}
            isAdmin={isAdmin}
            setEditBook={setEditBook}
          />
        ))}
      </div>

      {/* ===== Add Modal ===== */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <h2>הוספת ספר</h2>
          <BookForm
            categories={categories}
            ageGroups={ageGroups}
            onSubmit={async (data) => {
              try {
                const newBook = await Books.addBook({
                  title: data.title,
                  summary: data.summary,
                  author: data.author,
                  quantity: data.quantity,
                  pages: data.pages,
                  categoryid: data.categoryid,
                  agesid: data.agesid,
                  image: data.imageFile, // FILE
                });

                setBooks(prev => [newBook, ...prev]);
                setShowAddModal(false);
              } catch (err) {
                console.error(err);
                alert("Failed to add book");
              }
            }}
          />


        </Modal>
      )}

      {/* ===== Edit Modal ===== */}
      {editBook && (
        <Modal onClose={() => setEditBook(null)}>
          <h2>עריכת ספר</h2>
          <BookForm
            initialData={editBook}
            categories={categories}
            ageGroups={ageGroups}
            onSubmit={async (data) => {
              try {
                const updated = await Books.updateBook(editBook.id, {
                  title: data.title,
                  summary: data.summary,
                  author: data.author,
                  quantity: data.quantity,
                  pages: data.pages,
                  categoryid: data.categoryid,
                  agesid: data.agesid,
                  image: data.imageFile || null, // אופציונלי
                });

                setBooks(prev =>
                  prev.map(b => (b.id === updated.id ? updated : b))
                );
                setEditBook(null);
              } catch (err) {
                console.error(err);
                alert("Failed to update book");
              }
            }}
          />


        </Modal>
      )}
    </>
  );
}
