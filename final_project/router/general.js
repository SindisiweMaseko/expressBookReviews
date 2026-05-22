const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper helper function to check if username exists
const doesExist = (username) => {
  let userswithsamename = users.filter((user) => user.username === username);
  return userswithsamename.length > 0;
};

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user. Username or password missing." });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn], null, 4));
  } else {
    res.status(404).json({ message: "Book not found by this ISBN" });
  }
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let keys = Object.keys(books);
  let booksByAuthor = [];
  
  keys.forEach((key) => {
    if (books[key].author === author) {
      booksByAuthor.push({ "isbn": key, ...books[key] });
    }
  });

  if (booksByAuthor.length > 0) {
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let keys = Object.keys(books);
  let booksByTitle = [];

  keys.forEach((key) => {
    if (books[key].title === title) {
      booksByTitle.push({ "isbn": key, ...books[key] });
    }
  });

  if (booksByTitle.length > 0) {
    res.send(JSON.stringify(booksByTitle, null, 4));
  } else {
    res.status(404).json({ message: "No books found by this title" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    res.status(404).json({ message: "No reviews found for this book" });
  }
});

// ==========================================================
// IMPROVED SCOPE USING PROMISES / ASYNC-AWAIT WITH AXIOS
// ==========================================================

// Task 10: Get all books using Async-Await
public_users.get('/async-books', async function (req, res) {
    try {
        // Simulating an asynchronous database/API lookup operation wrap
        const getBooksPromise = new Promise((resolve) => {
            setTimeout(() => resolve(books), 100);
        });
        const bookList = await getBooksPromise;
        res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error fetching book database data asynchronously" });
    }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/async-isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const findBookByIsbn = new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject({ status: 404, message: "Book not found" });
            }
        }, 100);
    });

    findBookByIsbn
        .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
        .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Task 12: Get book details based on Author using Promises
public_users.get('/async-author/:author', function (req, res) {
    const author = req.params.author;
    const findBooksByAuthor = new Promise((resolve, reject) => {
        setTimeout(() => {
            let keys = Object.keys(books);
            let filtered = [];
            keys.forEach(key => {
                if (books[key].author === author) filtered.push({ isbn: key, ...books[key] });
            });
            if (filtered.length > 0) resolve(filtered);
            else reject({ status: 404, message: "Author profile not found" });
        }, 100);
    });

    findBooksByAuthor
        .then((results) => res.status(200).send(JSON.stringify(results, null, 4)))
        .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Task 13: Get book details based on Title using Promises
public_users.get('/async-title/:title', function (req, res) {
    const title = req.params.title;
    const findBooksByTitle = new Promise((resolve, reject) => {
        setTimeout(() => {
            let keys = Object.keys(books);
            let filtered = [];
            keys.forEach(key => {
                if (books[key].title === title) filtered.push({ isbn: key, ...books[key] });
            });
            if (filtered.length > 0) resolve(filtered);
            else reject({ status: 404, message: "Book title not found" });
        }, 100);
    });

    findBooksByTitle
        .then((results) => res.status(200).send(JSON.stringify(results, null, 4)))
        .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

module.exports.general = public_users;
