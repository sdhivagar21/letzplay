import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Mongo connected'))
  .catch((err) => console.error('Mongo error', err));
