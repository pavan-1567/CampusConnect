require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`[CampusConnect Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[CampusConnect API] Base URL: http://localhost:${PORT}/api/v1`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`[UnhandledRejection] Error: ${err.message}`);
      // Keep server alive in development
    });
  } catch (err) {
    console.error(`[Server Start Error] Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

