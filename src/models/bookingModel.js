import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  seatNumber: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ["booked", "cancelled_by_user", "cancelled_by_driver", "late", "completed"],
    default: "booked"
  },
  bookedAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  refundAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for faster querying
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Add a method to check if booking is expired
bookingSchema.methods.isExpired = function() {
  return this.expiresAt < new Date() && this.status === 'booked';
};

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
