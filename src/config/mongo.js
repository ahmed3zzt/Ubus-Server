import mongoose from 'mongoose';
import { getEnv } from './env.js';

const { mongoUri } = getEnv();

export async function connectMongo() {
  if (!mongoUri) throw new Error('MONGO_URI is required');
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
  return mongoose.connection;
}


