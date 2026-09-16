import mongoose from "mongoose";
import "@/models/index.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn(
    "[db] MONGODB_URI is not set. Set it in .env.local before hitting any database-backed route."
  );
}

// Reuse the connection across hot reloads / serverless invocations.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        // Tuned for a serverless/multi-instance deployment: keep each
        // instance's pool bounded (so N instances don't collectively exceed
        // MongoDB's max connection limit), but let it saturate individual
        // spikes; drop stalled connection attempts and idle sockets instead
        // of hanging a request thread indefinitely.
        maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 20,
        minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE) || 2,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        maxIdleTimeMS: 30000,
        retryWrites: true,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default connectDB;
