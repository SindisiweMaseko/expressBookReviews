const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ // returns boolean
  let validUsers = users.filter((user) => user.username === username);
  return validUsers.length > 0;
}

const authenticatedUser = (username, password)=>{ // returns boolean
  let matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}

// Task 7: Log in as a registered user
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({ message: "Error loggin in: Missing fields" });
  }

  if (authenticatedUser(username, password)) {
    // Sign a fresh token payload that expires in one hour (3600 seconds)
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    
    // Save this authentication token structure to the current active user session
    req.session.authorization = { accessToken, username };
    
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(28).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewContent = req.query.review;
  const username = req.session.authorization['username']; // Extracted by auth interceptor

  if (!reviewContent) {
      return res.status(400).json({ message: "Review content string query parameter is required" });
  }

  if (books[isbn]) {
      // Direct property assignment updates old content or assigns new content dynamically
      books[isbn].reviews[username] = reviewContent;
      return res.status(200).json({ message: `The review for book with ISBN ${isbn} has been added/updated.` });
  } else {
      return res.status(404).json({ message: "Target ISBN book object was not found." });
  }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];

  if (books[isbn]) {
      if (books[isbn].reviews[username]) {
          delete books[isbn].reviews[username]; // Remove the specified key mapping
          return res.status(200).json({ message: `Reviews for ISBN ${isbn} posted by user ${username} deleted.` });
      } else {
          return res.status(404).json({ message: "You have not submitted a review for this book." });
      }
  } else {
      return res.status(404).json({ message: "Target ISBN book object was not found." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
