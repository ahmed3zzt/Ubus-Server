import mongoose from 'mongoose';

// Schema للكراسي
const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});


const driverInfoSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  carModel: { type: String },
  carNumber: { type: String },
});
const tripSchema = new mongoose.Schema({
  driver: { type: driverInfoSchema, required: true }, 
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: Date, required: true },
  capacity: { type: Number, required: true, min: 1, max: 60 },
  seats: [seatSchema],
  availableSeats: { type: Number, required: true },
  status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
  route: {
      start: { type: String, required: true },  // نقطة الانطلاق
      end: { type: String, required: true },    // نقطة الوصول
    },
    price: {
      type: Number,
      required: true, // سعر الرحلة الكلي
      min: [0, "Price must be positive"],
    },
}, { timestamps: true });

// تهيئة الكراسي عند الإنشاء
tripSchema.pre('save', function(next) {
  if (this.isNew && this.seats.length == 0) {
    for (let i = 1; i <= this.capacity; i++) {
      this.seats.push({ seatNumber: i });
    }
    this.availableSeats = this.capacity;
  }
  next();
});


const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);

export default Trip;

