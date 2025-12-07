require('dotenv').config();
const connectDB = require('./config/database');
const { startServer } = require('./app');
const { initializeBot } = require('./services/discordBot');
const config = require('./config/app');

/**
 * Main application entry point
 */
const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    startServer(config.port);

    // Initialize Discord bot
    await initializeBot();

    console.log('✅ All services started successfully!');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the application
start();
