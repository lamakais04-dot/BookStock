import React, { useEffect, useState } from 'react'
import Books from '../services/books.js'
import Bookitem from './bookitem.jsx'
import '../csspages/books.css'
export default function AllBooks() {
    const [allbooks, setAllBooks] = useState([])

    useEffect(() => {
        async function getAllBooks() {
            try {
                const data = await Books.getBooks()
                setAllBooks(data)
            } catch (err) {
                console.error(err)
            }
        }

        getAllBooks()
    }, [])

    return (
        <div className="books-grid">
            {allbooks.map(b => (
                <Bookitem key={b.id} book={b} />
            ))}
        </div>
    )
}
