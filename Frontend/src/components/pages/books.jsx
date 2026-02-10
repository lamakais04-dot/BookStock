// pages/books.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import BookItem from "./BookItem";
import { useAuth } from "../context/AuthContext";
import { socket } from "../services/socket";

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

  const [totalBooksCount, setTotalBooksCount] = useState(0);
  const [borrowedBooksCount, setBorrowedBooksCount] = useState(0);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const booksPerPage = 10;
  const location = useLocation();

  const search = useMemo(() => {
    return new URLSearchParams(location.search).get("search") || "";
  }, [location.search]);

  // Keep initial order of fetched books stable
  const orderRef = useRef([]);

  const loadBooks = useCallback(
    async (page, catId, ageId, searchTerm, withSpinner = true) => {
      if (withSpinner) setLoading(true);

      try {
        const data = await Books.getBooks(
          page,
          booksPerPage,
          catId,
          ageId,
          searchTerm
        );

        const fetchedBooks = data?.books || [];

        if (orderRef.current.length === 0) {
          orderRef.current = fetchedBooks.map((b) => b.id);
        }

        const orderedBooks = [...fetchedBooks].sort(
          (a, b) =>
            orderRef.current.indexOf(a.id) -
            orderRef.current.indexOf(b.id)
        );

        setBooks(orderedBooks);
        setTotalPages(data?.totalPages || 1);
        setTotalBooksCount(data?.totalBooks || 0);
        setBorrowedBooksCount(data?.borrowedBooks || 0);
      } catch (err) {
        console.error(err);
        setBooks([]);
        setTotalPages(1);
      } finally {
        if (withSpinner) setLoading(false);
      }
    },
    []
  );

  /* =============== LOAD FILTER OPTIONS =============== */
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

  /* =============== FETCH ON PAGE / FILTER / SEARCH CHANGE =============== */

  // When filters/search change, reset to page 1 and clear order
  useEffect(() => {
    orderRef.current = [];
    setCurrentPage(1);
  }, [categoryId, ageGroupId, search]);

  // Whenever page / filters / search change -> fetch
  useEffect(() => {
    const delay = setTimeout(() => {
      loadBooks(currentPage, categoryId, ageGroupId, search, true);
    }, 400); // debounce for search/filter

    return () => clearTimeout(delay);
  }, [currentPage, categoryId, ageGroupId, search, loadBooks]);

  /* =============== LOCAL UPDATERS (CURRENT USER) =============== */
  const handleLocalBorrow = useCallback((bookId) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, quantity: Math.max(0, b.quantity - 1) }
          : b
      )
    );
    setBorrowedBooksCount((c) => c + 1);
  }, []);

  const handleLocalReturn = useCallback((bookId) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, quantity: b.quantity + 1 } : b
      )
    );
    setBorrowedBooksCount((c) => Math.max(0, c - 1));
  }, []);

  /* =============== SOCKET UPDATES (OTHER USERS) =============== */
  useEffect(() => {
    function handleBooksChanged(payload) {
      // ignore current user
      if (!payload?.userId || payload.userId === user?.id) return;

      setBooks((prev) => {
        if (!payload?.reason) return prev;

        switch (payload.reason) {
          case "borrowed":
            return prev.map((b) =>
              b.id === payload.id
                ? { ...b, quantity: Math.max(0, b.quantity - 1) }
                : b
            );

          case "returned":
            return prev.map((b) =>
              b.id === payload.id
                ? { ...b, quantity: b.quantity + 1 }
                : b
            );

          case "updated":
            return prev.map((b) =>
              b.id === payload.book.id ? { ...b, ...payload.book } : b
            );

          case "created":
            return payload.book ? [payload.book, ...prev] : prev;

          case "deleted":
            return prev.filter((b) => b.id !== payload.bookId);

          default:
            return prev;
        }
      });

      // stats are handled via fresh fetch, not via socket increments
    }

    socket.on("books_changed", handleBooksChanged);
    return () => socket.off("books_changed", handleBooksChanged);
  }, [user?.id]);

  const availableBooksCount = totalBooksCount - borrowedBooksCount;

  /* =============== JSX =============== */
  return (
    <>
      {/* STATS
      <div className="inventory-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{totalBooksCount}</div>
            <div className="stat-label">סה"כ ספרים</div>
          </div>
        </div>

        <div className="stat-card stat-borrowed">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-number">{borrowedBooksCount}</div>
            <div className="stat-label">ספרים מושאלים</div>
          </div>
        </div>

        <div className="stat-card stat-available">
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <div className="stat-number">
              {availableBooksCount}
            </div>
            <div className="stat-label">ספרים זמינים</div>
          </div>
        </div>
      </div> */}

      {/* ADD BOOK */}
      {isAdmin && (
        <div className="add-book-wrapper">
          <button
            className="add-book-btn"
            onClick={() => navigate("/book/new")}
          >
            ➕ הוסף ספר חדש
          </button>
        </div>
      )}

      {/* AGE FILTER */}
      <div className="age-filter">
        {ageGroups.map((age) => (
          <button
            key={age.id}
            className={`age-btn ${
              ageGroupId === age.id ? "active" : ""
            }`}
            onClick={() => {
              const next = ageGroupId === age.id ? null : age.id;
              orderRef.current = [];
              setAgeGroupId(next);
            }}
          >
            ★ {age.description}
          </button>
        ))}
      </div>

      {/* CLEAR FILTERS */}
      {(categoryId || ageGroupId || search) && (
        <div className="clear-filters-wrapper">
          <button
            className="clear-filters"
            onClick={() => {
              setCategoryId(null);
              setAgeGroupId(null);
              orderRef.current = [];
              setCurrentPage(1);
            }}
          >
            ✖ נקה סינון
          </button>
        </div>
      )}

      {/* BOOKS GRID */}
      <div className="books-grid">
        {loading ? (
          <div className="books-loading">
            <div className="loading-spinner" />
            <p>טוען ספרים...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="books-empty">
            <div className="books-empty-icon">📚</div>
            <h2>לא נמצאו ספרים</h2>
            <p>נסה לשנות את הסינון או החיפוש</p>
          </div>
        ) : (
          books.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              isAdmin={isAdmin}
              onLocalBorrow={handleLocalBorrow}
              onLocalReturn={handleLocalReturn}
            />
          ))
        )}
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => {
              orderRef.current = [];
              setCurrentPage((p) => p - 1);
            }}
          >
            הקודם
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => {
                orderRef.current = [];
                setCurrentPage(i + 1);
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => {
              orderRef.current = [];
              setCurrentPage((p) => p + 1);
            }}
          >
            הבא
          </button>
        </div>
      )}

      {/* CATEGORY MENU */}
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
                className={
                  categoryId === cat.id ? "active" : ""
                }
                onClick={() => {
                  const next =
                    cat.id === categoryId ? null : cat.id;
                  orderRef.current = [];
                  setCategoryId(next);
                  setIsFilterOpen(false);
                }}
              >
                ★ {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
