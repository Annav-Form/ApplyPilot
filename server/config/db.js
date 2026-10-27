import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn(
      '\n⚠️  [ApplyPilot DB Warning]: MONGODB_URI is not set in environment variables.\n' +
      '   The server will start, but database operations will return a configuration warning.\n' +
      '   To connect MongoDB Atlas:\n' +
      '   1. Create a free cluster on https://www.mongodb.com/cloud/atlas\n' +
      '   2. Copy the connection string and paste it into .env as MONGODB_URI\n'
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [ApplyPilot DB]: MongoDB connected to ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error('❌ [ApplyPilot DB Error]: Could not connect to MongoDB:', error.message);
    console.warn(
      '   Please check your MONGODB_URI credentials, network access (IP whitelist in Atlas), or local MongoDB service.\n'
    );
    return false;
  }
};

export const getDbStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    stateString: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  };
};

export default connectDB;
