import React, { useEffect, useState } from 'react'
import Books from '../services/books.js'

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
    <div>
      {allbooks.map(b => (
        <h1 key={b.id}>{b.title}</h1>
      ))}
    </div>
  )
}
