# discord-bot-express

A multi-feature Discord bot built with Node.js and Discord.js that provides attendance tracking and URL shortening services. Features include check-in/checkout commands, URL shortening with click tracking, and a web interface for URL redirects. Built with Express, MongoDB, and modular architecture.

## 📁 Project Structure

```
bot/
├── config/              # Configuration files
│   ├── app.js          # Application configuration
│   └── database.js     # MongoDB connection
├── controllers/         # Business logic
│   ├── urlController.js # URL redirect controller
│   └── attendanceController.js # Attendance controller
├── routes/              # API routes
│   ├── urlRoutes.js     # URL routes
│   └── attendanceRoutes.js # Attendance routes
├── models/              # Database models
│   ├── Url.js          # URL model
│   └── Attendance.js   # Attendance model
├── services/            # Services
│   └── discordBot.js   # Discord bot service
├── commands/            # Discord slash commands
│   ├── hello.js
│   ├── ping.js
│   ├── shorten.js      # URL shortening command
│   └── user.js
├── app.js              # Express application setup
├── server.js           # Main entry point
└── deploy-commands.js  # Deploy Discord commands
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Discord Bot Token
- Discord Application Client ID

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
# Discord Bot Configuration
TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/urlshortener

# Application Configuration
PORT=3000
BASE_URL=http://localhost:3000
NODE_ENV=development
```

3. Deploy Discord commands:
```bash
npm run deploy:commands
```

4. Start the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📝 Features

- **Attendance Tracking**: Use `/checkin` and `/checkout` commands to track user attendance
- **URL Shortening**: Use `/shorten url:<your-url>` in Discord to create short URLs
- **URL Redirects**: Click on short URLs to be redirected to the original URL
- **Click Tracking**: Automatically tracks clicks on shortened URLs
- **Duplicate Prevention**: Returns existing short URL if the same URL is shortened again
- **MongoDB Storage**: All URLs and attendance records are stored in MongoDB

## 🎯 Usage

### Discord Commands

- `/checkin` - Check in and mark your attendance
- `/checkout` - Check out and record your departure time
- `/shorten url:<url>` - Shorten a URL
- `/ping` - Check if bot is responsive
- `/hello target:<user>` - Say hello to a user
- `/user` - Get user information

### API Endpoints

- `GET /` - Home page
- `GET /:shortCode` - Redirect to original URL

## 🏗️ Architecture

### Separation of Concerns

- **Config**: Centralized configuration management
- **Controllers**: Handle business logic and HTTP responses
- **Routes**: Define API endpoints
- **Models**: Database schemas and models
- **Services**: External service integrations (Discord bot)
- **Commands**: Discord slash command definitions

### Best Practices

- ✅ Modular code structure
- ✅ Separation of concerns
- ✅ Centralized configuration
- ✅ Error handling
- ✅ Environment variable management
- ✅ Clean code organization

## 🔧 Configuration

All configuration is managed through:
- Environment variables (`.env` file)
- `config/app.js` - Application settings
- `config/database.js` - Database connection

## 📦 Dependencies

- `discord.js` - Discord API wrapper
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable management

## 🛠️ Development

The project follows Node.js best practices:
- Modular architecture
- Separation of concerns
- Error handling
- Environment-based configuration
- Clean code structure

## 📄 License

ISC
