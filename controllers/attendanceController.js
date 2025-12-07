const Attendance = require('../models/Attendance');

// Helper function to calculate duration
function calculateDuration(checkIn, checkOut) {
  if (!checkOut) return null;
  const diffMs = checkOut - checkIn;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours: diffHours, minutes: diffMinutes };
}

// Helper function to format duration
function formatDuration(duration) {
  if (!duration) return 'N/A';
  return `${duration.hours}h ${duration.minutes}m`;
}

const getAttendance = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { date, userId, limit = 50 } = req.query;

    let query = {};
    if (date) {
      query.date = date;
    }
    if (userId) {
      query.userId = userId;
    }

    // Fetch attendance records
    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1, checkIn: -1 })
      .limit(parseInt(limit))
      .lean();

    // Format attendance records with duration
    const formattedRecords = attendanceRecords.map((record) => {
      const duration = calculateDuration(record.checkIn, record.checkOut);
      return {
        ...record,
        duration: formatDuration(duration),
        checkInFormatted: record.checkIn.toLocaleString(),
        checkOutFormatted: record.checkOut ? record.checkOut.toLocaleString() : null,
        dateFormatted: new Date(record.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };
    });

    // Group by date
    const groupedByDate = {};
    formattedRecords.forEach((record) => {
      if (!groupedByDate[record.date]) {
        groupedByDate[record.date] = [];
      }
      groupedByDate[record.date].push(record);
    });

    res.json({
      success: true,
      count: formattedRecords.length,
      attendance: formattedRecords,
      groupedByDate,
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching attendance records.',
    });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayRecords = await Attendance.find({ date: today })
      .sort({ checkIn: -1 })
      .lean();

    const formattedRecords = todayRecords.map((record) => {
      const duration = calculateDuration(record.checkIn, record.checkOut);
      return {
        ...record,
        duration: formatDuration(duration),
        checkInFormatted: record.checkIn.toLocaleString(),
        checkOutFormatted: record.checkOut ? record.checkOut.toLocaleString() : null,
      };
    });

    res.json({
      success: true,
      date: today,
      count: formattedRecords.length,
      attendance: formattedRecords,
    });
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching today\'s attendance.',
    });
  }
};

module.exports = {
  getAttendance,
  getTodayAttendance,
};

