import mongoose from 'mongoose';

export const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      isDbError: true,
      message:
        'MongoDB is not connected. Please provide a valid MONGODB_URI in your .env file or connect to MongoDB Atlas to persist records.',
    });
  }
  next();
};
