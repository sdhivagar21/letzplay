import mongoose from 'mongoose';

const PreorderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true }, // from req.user.email

    sku:   { type: String, required: true },
    name:  { type: String, required: true },
    price: { type: Number, required: true },

    size:  { type: String },
    color: { type: String },
    qty:   { type: Number, default: 1 },

    status: { type: String, default: 'pending', enum: ['pending','processed','shipped','cancelled'] }
  },
  { timestamps: true }
);

export default mongoose.model('Preorder', PreorderSchema);
