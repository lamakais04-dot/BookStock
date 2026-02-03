import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import BookItem from "./BookItem";
import { useAuth } from "../context/AuthContext";


import "../csspages/books.css";
import "../csspages/filters.css";
import "../csspages/pagination.css";

export default function AllBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [ageGroupId, setAgeGroupId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const booksPerPage = 10;
  const location = useLocation();
  const search = new URLSearchParams(location.search).get("search") || "";

  /* ===== Fetch books ===== */
  useEffect(() => {
    setLoading(true);
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
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [currentPage, categoryId, ageGroupId, search]);

  /* Reset page on filter change */
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, ageGroupId, search]);

  /* ===== Load filters ===== */
  useEffect(() => {
    async function loadFilters() {
      try {
        const cats = await Filters.getCategories();
        const ages = await Filters.getAgeGroups();
        setCategories(cats);
        setAgeGroups(ages);
      } catch (err) {
        console.error(err);
      }
    }
    loadFilters();
  }, []);

  return (
    <>
      {/* ===== Admin Add Button - צף בפינה ===== */}
      {isAdmin && (
        <div className="add-book-wrapper">
          <button className="add-book-btn" onClick={() => navigate("/book/new")}>
            <span className="icon">➕</span>
            הוסף ספר חדש
          </button>
        </div>
      )}

      {/* ===== Age Filter ===== */}
      <div className="age-filter">
        {ageGroups.map((age) => (
          <button
            key={age.id}
            className={`age-btn ${ageGroupId === age.id ? "active" : ""}`}
            onClick={() => setAgeGroupId(ageGroupId === age.id ? null : age.id)}
          >
            <span className="star">★</span>
            {age.description}
          </button>
        ))}
      </div>

      {/* ===== Clear Filters ===== */}
      {(categoryId || ageGroupId || search) && (
        <div className="clear-filters-wrapper">
          <button
            className="clear-filters"
            onClick={() => {
              setCategoryId(null);
              setAgeGroupId(null);
              setCurrentPage(1);
            }}
          >
            ✖ נקה סינון
          </button>
        </div>
      )}

      {/* ===== Books Grid ===== */}
      <div className="books-grid">
        {loading ? (
          <div className="books-loading">
            <div className="loading-spinner"></div>
            <p>טוען ספרים...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="books-empty">
            <div className="books-empty-icon">📚</div>
            <h2>לא נמצאו ספרים</h2>
            <p>נסה לשנות את הסינון או את מילות החיפוש</p>
          </div>
        ) : (
          books.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              setBooks={setBooks}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>

      {/* ===== Pagination ===== */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            הקודם
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            הבא
          </button>
        </div>
      )}

      {/* ===== Categories Menu (Floating/Hover Logic) ===== */}
      <div className="category-menu">
        <button
          className="menu-btn"
          onMouseEnter={() => setIsFilterOpen(true)}
          onMouseLeave={() => setIsFilterOpen(false)}
        >
          ☰
        </button>

        {isFilterOpen && (
          <div
            className="category-list"
            onMouseEnter={() => setIsFilterOpen(true)}
            onMouseLeave={() => setIsFilterOpen(false)}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={categoryId === cat.id ? "active" : ""}
                onClick={() => {
                  setCategoryId(cat.id === categoryId ? null : cat.id);
                  setIsFilterOpen(false);
                }}
              >
                <span className="star">★</span>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}