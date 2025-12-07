const Url = require('../models/Url');
const Attendance = require('../models/Attendance');
const config = require('../config/app');
const crypto = require('crypto');

// Generate a random short code
function generateShortCode() {
  return crypto.randomBytes(4).toString('base64url').substring(0, 8);
}

// Validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const urlDoc = await Url.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 } },
      {
        new: true,
        upsert: false,
      }
    );

    if (!urlDoc) {
      return res.status(404).render('404-url');
    }

    // Set cache-control headers to prevent browser caching
    // This ensures every redirect hits the server and increments clicks
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    // Use 302 (temporary redirect) instead of 301 (permanent redirect)
    // Browsers don't cache 302 redirects as aggressively, ensuring clicks are tracked
    res.redirect(302, urlDoc.originalUrl);
  } catch (error) {
    console.error('Error redirecting URL:', error);
    res.status(500).render('500', {
      message: 'An error occurred while processing your request.',
    });
  }
};

const getHome = async (req, res) => {
  try {
    // Fetch all URLs from database, sorted by creation date (newest first)
    const urls = await Url.find({}).sort({ createdAt: -1 }).lean();

    // Fetch today's attendance records
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.find({ date: today })
      .sort({ checkIn: -1 })
      .limit(20)
      .lean();

    // Fetch recent attendance records (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAttendance = await Attendance.find({
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ date: -1, checkIn: -1 })
      .limit(50)
      .lean();

    // Format attendance records
    const formatAttendance = (record) => {
      let duration = 'N/A';
      if (record.checkOut) {
        const diffMs = record.checkOut - record.checkIn;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = `${hours}h ${minutes}m`;
      }
      return {
        ...record,
        duration,
        checkInFormatted: record.checkIn.toLocaleString(),
        checkOutFormatted: record.checkOut ? record.checkOut.toLocaleString() : 'Not checked out',
        status: record.checkOut ? 'Completed' : 'Active',
      };
    };

    const formattedTodayAttendance = todayAttendance.map(formatAttendance);
    const formattedRecentAttendance = recentAttendance.map(formatAttendance);

    // Render home page with URLs and attendance data
    res.render('home', {
      urls,
      baseUrl: config.baseUrl,
      todayAttendance: formattedTodayAttendance,
      recentAttendance: formattedRecentAttendance,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).render('500', {
      message: 'An error occurred while loading the page.',
    });
  }
};

const createShortUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      const urls = await Url.find({}).sort({ createdAt: -1 }).lean();
      return res.render('home', {
        urls,
        baseUrl: config.baseUrl,
        error: 'Please provide a URL to shorten.',
        success: null,
      });
    }

    const originalUrl = url.trim();

    // Validate URL
    if (!isValidUrl(originalUrl)) {
      const urls = await Url.find({}).sort({ createdAt: -1 }).lean();
      return res.render('home', {
        urls,
        baseUrl: config.baseUrl,
        error: 'Invalid URL. Please provide a valid HTTP or HTTPS URL.',
        success: null,
      });
    }

    // Check if URL already exists
    let urlDoc = await Url.findOne({ originalUrl });

    if (urlDoc) {
      // URL already exists, return existing short URL
      const urls = await Url.find({}).sort({ createdAt: -1 }).lean();
      const shortUrl = `${config.baseUrl}/${urlDoc.shortCode}`;
      return res.render('home', {
        urls,
        baseUrl: config.baseUrl,
        error: null,
        success: `This URL was already shortened! Short URL: ${shortUrl}`,
      });
    }

    // Generate unique short code
    let shortCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortCode = generateShortCode();
      const existing = await Url.findOne({ shortCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      const urls = await Url.find({}).sort({ createdAt: -1 }).lean();
      return res.render('home', {
        urls,
        baseUrl: config.baseUrl,
        error: 'Failed to generate a unique short code. Please try again.',
        success: null,
      });
    }

    // Create new URL document
    urlDoc = new Url({
      originalUrl,
      shortCode,
    });

    await urlDoc.save();

    // Fetch updated URLs list
    const urls = await Url.find({}).sort({ createdAt: -1 }).lean();
    const shortUrl = `${config.baseUrl}/${shortCode}`;

    res.render('home', {
      urls,
      baseUrl: config.baseUrl,
      error: null,
      success: `URL shortened successfully! Short URL: ${shortUrl}`,
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    const urls = await Url.find({}).sort({ createdAt: -1 }).lean();
    res.render('home', {
      urls,
      baseUrl: config.baseUrl,
      error:
        'An error occurred while shortening the URL. Please try again later.',
      success: null,
    });
  }
};

module.exports = {
  redirectUrl,
  getHome,
  createShortUrl,
};
