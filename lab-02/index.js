const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = process.env.DB_PATH || path.join(__dirname, "book.db");
const PORT = process.env.PORT || 3000;

let db = null;

// Open the database FIRST and start listening only if that succeeds.
// If the connection fails we exit, so the server never runs without a database.
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ---------- helpers ----------

// A route id must be a positive whole number (e.g. "3", not "abc" or "3; DROP").
const isValidId = (value) => /^[1-9]\d*$/.test(value);

// Validates and normalises a book body. Returns { error } or { book }.
const validateBook = (body) => {
  const { title, author, price, pages } = body || {};
  if (typeof title !== "string" || title.trim() === "") {
    return { error: "title must be a non-empty string" };
  }
  if (typeof author !== "string" || author.trim() === "") {
    return { error: "author must be a non-empty string" };
  }
  if (!Number.isInteger(price) || price < 0) {
    return { error: "price must be a non-negative integer" };
  }
  if (!Number.isInteger(pages) || pages <= 0) {
    return { error: "pages must be a positive integer" };
  }
  return { book: { title: title.trim(), author: author.trim(), price, pages } };
};

// ---------- routes ----------

// 1. GET /books/  -> all books
app.get("/books/", async (request, response) => {
  try {
    const getBooksQuery = `SELECT * FROM book ORDER BY id;`;
    const books = await db.all(getBooksQuery);
    response.status(200).send(books);
  } catch (error) {
    response.status(500).send({ error: "Internal server error" });
  }
});

// 2. GET /books/:bookId/  -> one book
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) {
    return response.status(400).send({ error: "bookId must be a positive integer" });
  }
  try {
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const book = await db.get(getBookQuery, [bookId]);
    if (book === undefined) {
      return response.status(404).send({ error: "Book not found" });
    }
    response.status(200).send(book);
  } catch (error) {
    response.status(500).send({ error: "Internal server error" });
  }
});

// 3. POST /books/  -> add a book
app.post("/books/", async (request, response) => {
  const { error, book } = validateBook(request.body);
  if (error) {
    return response.status(400).send({ error });
  }
  try {
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);`;
    const dbResponse = await db.run(addBookQuery, [
      book.title,
      book.author,
      book.price,
      book.pages,
    ]);
    response
      .status(201)
      .location(`/books/${dbResponse.lastID}/`)
      .send({ bookId: dbResponse.lastID, message: "Book added successfully" });
  } catch (err) {
    response.status(500).send({ error: "Internal server error" });
  }
});

// 4. PUT /books/:bookId/  -> replace (update) an existing book
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) {
    return response.status(400).send({ error: "bookId must be a positive integer" });
  }
  const { error, book } = validateBook(request.body);
  if (error) {
    return response.status(400).send({ error });
  }
  try {
    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;`;
    const dbResponse = await db.run(updateBookQuery, [
      book.title,
      book.author,
      book.price,
      book.pages,
      bookId,
    ]);
    if (dbResponse.changes === 0) {
      return response.status(404).send({ error: "Book not found" });
    }
    response.status(200).send({ message: "Book updated successfully" });
  } catch (err) {
    response.status(500).send({ error: "Internal server error" });
  }
});

// 5. DELETE /books/:bookId/  -> remove a book
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) {
    return response.status(400).send({ error: "bookId must be a positive integer" });
  }
  try {
    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
    const dbResponse = await db.run(deleteBookQuery, [bookId]);
    if (dbResponse.changes === 0) {
      return response.status(404).send({ error: "Book not found" });
    }
    response.status(200).send({ message: "Book deleted successfully" });
  } catch (err) {
    response.status(500).send({ error: "Internal server error" });
  }
});

// Malformed JSON body (express.json throws before our route runs) -> 400, not a stack trace.
app.use((err, request, response, next) => {
  if (err.type === "entity.parse.failed") {
    return response.status(400).send({ error: "Invalid JSON body" });
  }
  response.status(500).send({ error: "Internal server error" });
});

module.exports = app;
