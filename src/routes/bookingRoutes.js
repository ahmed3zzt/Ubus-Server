import express from 'express';
import { bookSeat, cancelBooking, checkIn, driverCancelTrip } from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authmiddleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(verifyToken);

// Book a seat
router.post('/book', bookSeat);

// Cancel a booking (user)
router.post('/cancel', cancelBooking);

// Check-in for a booking
router.post('/checkin', checkIn);

// Driver cancels a trip
router.post('/driver-cancel', driverCancelTrip);

export default router;
