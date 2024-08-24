const express = require("express");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookSchema = require("../models/bookSchema");
const ExpressError = require("../expressError");

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */
router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema);
    if (!result.valid) {
      const listOfErrors = result.errors.map(error => error.stack);
      return next(new ExpressError(listOfErrors, 400));  // Early return on validation failure
    }

    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    console.error("POST /books Error:", err);
    return next(new ExpressError("Failed to create book", 500));
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */
router.put("/:isbn", async function (req, res, next) {
  try {
    if ("isbn" in req.body && req.body.isbn !== req.params.isbn) {
      return next(new ExpressError("ISBN in body must match ISBN in URL", 400));  // Early return on validation failure
    }

    const result = jsonschema.validate(req.body, bookSchema);
    if (!result.valid) {
      const listOfErrors = result.errors.map(error => error.stack);
      return next(new ExpressError(listOfErrors, 400));  // Early return on validation failure
    }

    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    console.error("PUT /books/:isbn Error:", err);
    return next(new ExpressError("Failed to update book", 500));
  }
});



/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
