import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true, default: null },
    passwordHash: { type: String, required: true },
    name: { type: String },
    is_verified: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    is_banned: { type: Boolean, default: false },
    collage_name: { type: String , default: 'جامعة سوهاج' },
    home_address: { type: String , enum: ['موقف بحري', 'دار السلام', 'المحافظة', 'أخميم'] , required: true},
  },
  { timestamps: true }
);



export const User = mongoose.model('User', userSchema);


