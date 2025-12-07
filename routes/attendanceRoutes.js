const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getTodayAttendance,
} = require('../controllers/attendanceController');

/**
 * @route   GET /api/attendance
 * @desc    Get all attendance records (with optional filters)
 * @access  Public
 * @query   date, userId, limit
 */
router.get('/', getAttendance);

/**
 * @route   GET /api/attendance/today
 * @desc    Get today's attendance records
 * @access  Public
 */
router.get('/today', getTodayAttendance);

module.exports = router;

