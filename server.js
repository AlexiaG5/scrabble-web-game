const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create a session
const app = express();
const session = require('express-session');
app.use(session({
  secret: '64d5791cae138765b07a7a1299958c2c3e39ba032d81adfa4a594b42f7af9d57ef3e9acd22262e638fc05b84d2',
  resave: false,
  saveUninitialized: true,
}));

// Use the database and the HTML and json files
const db = new sqlite3.Database('./database.db');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'login_pages')));
app.use(express.static(path.join(__dirname, 'game_pages')));

// Handle the error message that shows up - due to browser icon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // Do not show the error msg
});

// Route to register a user
app.post('/register', (req, res) => {
  const { email, username, password } = req.body;

  // Check if the email already exists
  const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
  db.get(checkEmailSql, [email], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: 'Database error while checking email.' });
    }
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send({ message: 'Error hashing password' });
      }

      // Proceed to register the new user
      const sqlInsertUser = 'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)';
      db.run(sqlInsertUser, [email, username, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error registering user' });
        }
        return res.status(201).json({ message: 'Registration successful' });
      });
    });
  });
});

// Route to login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check user info
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [email], (err, row) => {
    if (err || !row) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the password with the hashed password in the database
    bcrypt.compare(password, row.password_hash, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(400).send({ message: 'Invalid password' });
      }

      // Successful login
      req.session.isGuest = false; // Clear guest session
      console.log('User Login successful for:', email);
      console.log('Session Data:', req.session);  // Log session data
      req.session.user = email; // Save user email in the session
      
      // Send the email and username if login is successful
      res.json({
        message: 'Login successful',
        email: row.email,
        username: row.username
      });
    });
  });
});

// Route to guest login
app.post('/guestLogin', (req, res) => {
  req.session.isGuest = true;
    res.json({ success: true });
});

app.get("/userStatus", (req, res) => {
  res.json({
      isGuest: req.session.isGuest || false,
      username: req.session.user ? req.session.user.username : "Guest"
  });
});

app.get('/mainMenu', (req, res) => {
  if (!req.session.isGuest && !req.session.user) {
    return res.redirect('/');  // Redirect to login page if not logged in or not guest
  }

  const filePath = path.join(__dirname, 'game_pages', 'mainMenu.html');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.send(data);
  });
});

app.get('/gameScreen', (req, res) => {
  if (!req.session.isGuest && !req.session.user) {
    return res.redirect('/');  // Redirect to login page if not logged in
  }
  
  const filePath = path.join(__dirname, 'game_pages', 'gameScreen.html');

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Server error');
      }
      res.send(data);
  });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/'); // Redirect to the login page
    });
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});