const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const ejs = require('ejs');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// Define user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/ls', (req, res) => {
  res.render('ls');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  const newUser = new User({
    username,
    password: password
  });

  newUser.save((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error signing up');
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username }, async (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error logging in');
      return;
    }

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    const match = password;
    if (match) {
      res.redirect('/index.html'); // Redirect upon successful login
    } else {
      res.status(401).send('Incorrect password');
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
