import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Set the strictQuery option to suppress the warning
mongoose.set('strictQuery', false);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('Failed to connect to MongoDB:', error.message);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('Error establishing MongoDB connection:', e.message);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Add this function to test the connection
async function testConnection() {
  try {
    await dbConnect();
    console.log('Database connection test successful');
  } catch (error) {
    console.error('Database connection test failed:', error.message);
  }
}

export default dbConnect;
export { testConnection };