import React, { useEffect, useState } from "react";
import Books from "../services/books";
import BookItem from "./BookItem";
import "../csspages/books.css";
import "../csspages/pagination.css";

export default function AllBooks() {
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const booksPerPage = 8;

    useEffect(() => {
        async function getAllBooks() {
            try {
                const data = await Books.getBooks(currentPage, booksPerPage);
                setBooks(data.books);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error(err);
            }
        }

        getAllBooks();
    }, [currentPage]);

    return (
        <>
            <div className="books-grid">
                {books.map((b) => (
                    <BookItem key={b.id} book={b} />
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
        </>
    );
}
