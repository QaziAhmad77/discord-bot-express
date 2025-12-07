require('dotenv').config();
const express = require('express');
const path = require('path');
const urlRoutes = require('./routes/urlRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const config = require('./config/app');

const app = express();

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', urlRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404-page');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('500', { message: 'An unexpected error occurred.' });
});

const startServer = (port = config.port) => {
  app.listen(port, () => {
    console.log(`🚀 Express server running on http://localhost:${port}`);
  });
};

module.exports = { app, startServer };
