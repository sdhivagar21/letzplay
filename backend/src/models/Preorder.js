import mongoose from 'mongoose';

const preorderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userEmail: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productSKU: String,
  productName: String,
  size: String,
  color: String,
  quantity: Number,
  price: Number,
  status: { type: String, enum: ['pending', 'processed', 'shipped', 'cancelled'], default: 'pending' },
  preorderDate: { type: Date, default: Date.now },
  deliveryDate: Date
});

export default mongoose.model('Preorder', preorderSchema);
