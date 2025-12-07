const express = require('express');
const router = express.Router();
const {
  redirectUrl,
  getHome,
  createShortUrl,
} = require('../controllers/urlController');

router.get('/error-test', (req, res, next) => {
  const err = new Error('Invalid ID!');
  err.statusCode = 400;
  next(new Error('Test error!'));
});

/**
 * @route   GET /
 * @desc    Home page
 * @access  Public
 */
router.get('/', getHome);

/**
 * @route   POST /
 * @desc    Create a short URL
 * @access  Public
 */
router.post('/', createShortUrl);

/**
 * @route   GET /:shortCode
 * @desc    Redirect to original URL
 * @access  Public
 */
router.get('/:shortCode', redirectUrl);

module.exports = router;
