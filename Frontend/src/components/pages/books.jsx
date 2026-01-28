import React, { useEffect, useState } from "react";
import Books from "../services/books";
import Filters from "../services/filtirs";
import BookItem from "./BookItem";

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

    const booksPerPage = 8;

    useEffect(() => {
        async function getAllBooks() {
            try {
                const data = await Books.getBooks(
                    currentPage,
                    booksPerPage,
                    categoryId,
                    ageGroupId
                );
                console.log(data.books)
                setBooks(data.books);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error(err);
            }
        }

        getAllBooks();
    }, [currentPage, categoryId, ageGroupId]);

    useEffect(() => {
        setCurrentPage(1);
    }, [categoryId, ageGroupId]);


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
            <div className="age-filter">
                {ageGroups?.map(age => (
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

            <div className="books-grid">
                {books?.map(book => (
                    <BookItem key={book.id} book={book} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
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
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        הבא
                    </button>
                </div>
            )}

            <div className="category-menu">
                <button
                    className="menu-btn"
                    onClick={() => setIsFilterOpen(prev => !prev)}
                >
                    ☰
                </button>

                {isFilterOpen && (
                    <div className="category-list">
                        {categories?.map(cat => (
                            <button
                                key={cat.id}
                                className={categoryId === cat.id ? "active" : ""}
                                onClick={() => {
                                    setCategoryId(cat.id);
                                    setIsFilterOpen(false);
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}

                        <button
                            className="clear-filters"
                            onClick={() => {
                                setCategoryId(null);
                                setAgeGroupId(null);
                                setIsFilterOpen(false);
                            }}
                        >
                            נקה סינון
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
