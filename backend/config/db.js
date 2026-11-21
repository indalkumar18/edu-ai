import mongoose from "mongoose";

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export default async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add your MongoDB Atlas connection string to backend/.env.");
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    if (error?.message?.includes("authentication failed") || error?.code === 18) {
      throw new Error("MongoDB authentication failed. Check the Database User username/password in backend/.env.");
    }
    if (error?.code === "ENOTFOUND" || error?.code === "ECONNREFUSED" || error?.code === "ECONNRESET") {
      throw new Error(`MongoDB network/DNS connection failed: ${error.message}`);
    }
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}
