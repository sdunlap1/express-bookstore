/** Common config for bookstore. */


let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql://stephend:1gneous1@localhost/books-test";
} else {
  DB_URI = process.env.DATABASE_URL || "postgresql://stephend:1gneous1@localhost/books";
}


module.exports = { DB_URI };