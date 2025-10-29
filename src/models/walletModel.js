import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["deposit", "withdraw"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  referenceId: {
    type: String, // مثلاً رقم العملية من Paymob أو PayTabs أو غيره
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // كل مستخدم عنده محفظة واحدة فقط
    },
    balance: {
      type: Number,
      default: 20, // الرصيد الابتدائي
      min: 0,
    },
    currency: {
      type: String,
      default: "EGP",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
