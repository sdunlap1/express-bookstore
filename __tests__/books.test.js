// __tests__/books.test.js

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testBook;

beforeEach(async () => {
  // Insert a test book before each test
  const result = await db.query(
    `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
     VALUES ('1234567890', 'http://a.co/test', 'Test Author', 'Test Language', 100, 'Test Publisher', 'Test Title', 2022)
     RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`
  );
  testBook = result.rows[0];
});

afterEach(async () => {
  // Clean up after each test
  await db.query("DELETE FROM books");
});

afterAll(async () => {
  // Close the DB connection after all tests
  await db.end();
});

describe("GET /books", () => {
  test("Gets a list of all books", async () => {
    const res = await request(app).get("/books");
    expect(res.statusCode).toBe(200);
    expect(res.body.books).toHaveLength(1);
    expect(res.body.books[0]).toHaveProperty("isbn");
  });
});

describe("GET /books/:isbn", () => {
  test("Gets a single book by ISBN", async () => {
    const res = await request(app).get(`/books/${testBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.book).toHaveProperty("isbn");
    expect(res.body.book.isbn).toBe(testBook.isbn);
  });
});

describe("POST /books", () => {
  test("Creates a new book", async () => {
    const newBook = {
      isbn: "0987654321",
      amazon_url: "http://a.co/new",
      author: "New Author",
      language: "New Language",
      pages: 200,
      publisher: "New Publisher",
      title: "New Title",
      year: 2023,
    };

    const res = await request(app).post("/books").send(newBook);
    expect(res.statusCode).toBe(201);
    expect(res.body.book).toHaveProperty("isbn");
    expect(res.body.book.title).toBe("New Title");
  });

  test("Prevents creating a book with invalid data", async () => {
    const res = await request(app).post("/books").send({});
    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /books/:isbn", () => {
  test("Updates a single book", async () => {
    const res = await request(app).put(`/books/${testBook.isbn}`).send({
      isbn: testBook.isbn,
      amazon_url: "http://a.co/updated",
      author: "Updated Author",
      language: "Updated Language",
      pages: 150,
      publisher: "Updated Publisher",
      title: "Updated Title",
      year: 2024,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.book.title).toBe("Updated Title");
  });

  test("Prevents updating a book with invalid data", async () => {
    const res = await request(app).put(`/books/${testBook.isbn}`).send({
      pages: "not-a-number",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /books/:isbn", () => {
  test("Deletes a single book", async () => {
    const res = await request(app).delete(`/books/${testBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });

  test("Responds with 404 if book not found", async () => {
    const res = await request(app).delete(`/books/9999999999`);
    expect(res.statusCode).toBe(404);
  });
});
