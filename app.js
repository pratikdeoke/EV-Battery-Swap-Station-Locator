const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const pool = require('./db');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.get('/', (req, res) => res.render('index'));
app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users(username, password) VALUES ($1, $2)', [username, hash]);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('Registration error. Maybe user already exists.');
  }
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.redirect('/dashboard');
    } else res.send('Invalid credentials');
  } catch (err) {
    console.error(err);
    res.send('Login error');
  }
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const stations = await pool.query('SELECT * FROM stations');
  res.render('dashboard', { user: req.session.user.username, stations: stations.rows });
});

app.listen(3000, () => console.log('Server started on port 3000'));