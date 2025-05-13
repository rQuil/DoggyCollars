const mongoose = require('mongoose');
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// atlus
const dbURI = 'mongodb+srv://admin:admin123@cluster0.t48sa.mongodb.net/project5?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas (project5)'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// flash
app.use(session({
  secret: 'jorgevallejosecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: dbURI })
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
app.get('/', (req, res) => res.render('index'));

const itemRoutes  = require('./routes/items');
const userRoutes  = require('./routes/users');
app.use('/items', itemRoutes);
app.use('/users', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', {
    code: 404,
    error: `The server cannot locate resource at ${req.originalUrl}`
  });
});

// Global Error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { code:500, error: 'Internal Server Error' });
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
