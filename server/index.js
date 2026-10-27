import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
=====================================================
🚀 ApplyPilot Server running on http://localhost:${PORT}
📁 Environment: ${process.env.NODE_ENV || 'development'}
📡 Health Check: http://localhost:${PORT}/api/health
=====================================================
    `);
  });
});
