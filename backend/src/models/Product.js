import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: { type: String, unique: true },
  name: String,
  collection: String,
  price: Number,
  description: String,
  sizes: [String],
  colors: [String],
  images: [String],
  stock: Number
});

export default mongoose.model('Product', productSchema);
