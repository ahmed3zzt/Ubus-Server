import mongoose from 'mongoose';
import {User} from '../models/userModel.js';
import Trip from '../models/tripModel.js';
import Booking from '../models/bookingModel.js';
import Wallet from '../models/walletModel.js';
// Helper function to handle transactions
const withTransaction = async (operations) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await operations(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Book a seat
export const bookSeat = async (req, res) => {
  try {
    const { tripId, seatNumber } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and user data is in req.user

    if (!tripId || !seatNumber) {
      return res.status(400).json({ success: false, message: 'Trip ID and seat number are required' });
    }

    const result = await withTransaction(async (session) => {
      // 1. Validate trip exists and is scheduled
      const trip = await Trip.findById(tripId).session(session);
      if (!trip) {
        throw new Error('Trip not found');
      }
      if (trip.status !== 'scheduled') {
        throw new Error('Trip is not available for booking');
      }

      // 2. Check seat availability
      const seat = trip.seats.find(s => s.seatNumber === seatNumber);
      if (!seat || seat.isBooked) {
        throw new Error('Seat is not available');
      }

      // 3. Check user's coin balance
      const user = await User.findById(userId).session(session);
      const wallet = await Wallet.findById(user.walletId).session(session);
      if (wallet.balance < trip.price) {
        throw new Error('Insufficient coins');
      }

      // 4. Deduct coins
      wallet.balance -= trip.price;
      await wallet.save({ session });

      // 5. Update seat status
      seat.isBooked = true;
      seat.bookedBy = userId;
      trip.availableSeats--;
      await trip.save({ session });

      // 6. Create booking
      const booking = new Booking({
        tripId,
        userId,
        seatNumber,
        amountPaid: trip.price,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      });
      await booking.save({ session });

      return {
        bookingId: booking._id,
        remainingCoins: wallet.balance
      };
    });

    res.status(200).json({
      success: true,
      message: 'Seat booked successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Booking failed',
    });
  }
};

// Cancel a booking (user)
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const result = await withTransaction(async (session) => {
      // 1. Find the booking
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) {
        throw new Error('Booking not found');
      }
      if (booking.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to cancel this booking');
      }
      if (booking.status !== 'booked') {
        throw new Error('Only active bookings can be cancelled');
      }

      // 2. Find the trip
      const trip = await Trip.findById(booking.tripId).session(session);
      if (!trip) {
        throw new Error('Trip not found');
      }

      // 3. Refund 98% of the amount
      const refundAmount = Math.floor(booking.amountPaid * 0.98);
      
      const user = await User.findById(userId).session(session);
      const wallet = await Wallet.findById(user.walletId).session(session);
      wallet.balance += refundAmount;
      await wallet.save({ session });

      // 4. Update seat status
      const seat = trip.seats.find(s => s.seatNumber === booking.seatNumber);
      if (seat) {
        seat.isBooked = false;
        seat.bookedBy = null;
        trip.availableSeats++;
        await trip.save({ session });
      }

      // 5. Update booking status
      booking.status = 'cancelled_by_user';
      booking.refundAmount = refundAmount;
      await booking.save({ session });

      return {
        bookingId: booking._id,
        refundAmount,
        remainingCoins: wallet.balance
      };
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Cancellation failed',
    });
  }
};

// Check-in for a booking
export const checkIn = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (booking.status !== 'booked') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot check in. Booking status is ${booking.status}` 
      });
    }

    booking.status = 'completed';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      data: { bookingId: booking._id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Check-in failed',
    });
  }
};

// Driver cancels trip
export const driverCancelTrip = async (req, res) => {
  try {
    const { tripId } = req.body;
    const driverId = req.user._id; // Assuming driver is authenticated

    if (!tripId) {
      return res.status(400).json({ success: false, message: 'Trip ID is required' });
    }

    await withTransaction(async (session) => {
      // 1. Find and update the trip
      const trip = await Trip.findById(tripId).session(session);
      if (!trip) {
        throw new Error('Trip not found');
      }
      if (trip.driver_id.toString() !== driverId.toString()) {
        throw new Error('Unauthorized to cancel this trip');
      }
      if (trip.status !== 'scheduled') {
        throw new Error('Only scheduled trips can be cancelled');
      }

      // 2. Find all active bookings for this trip
      const bookings = await Booking.find({
        tripId: trip._id,
        status: 'booked'
      }).session(session);

      // 3. Process refunds for all bookings
      for (const booking of bookings) {
        const user = await User.findById(booking.userId).session(session);
        if (user) {
          const wallet = await Wallet.findById(user.walletId).session(session);
          wallet.balance += booking.amountPaid; // Full refund
          await wallet.save({ session });
        }
        
        // Update booking status
        booking.status = 'cancelled_by_driver';
        booking.refundAmount = booking.amountPaid;
        await booking.save({ session });
      }

      // 4. Update trip status and free all seats
      trip.status = 'cancelled';
      trip.seats.forEach(seat => {
        seat.isBooked = false;
        seat.bookedBy = null;
      });
      trip.availableSeats = trip.capacity;
      await trip.save({ session });
    });

    res.status(200).json({
      success: true,
      message: 'Trip cancelled successfully. All users have been refunded.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel trip',
    });
  }
};

// Background job to handle late bookings
const processLateBookings = async () => {
  try {
    const lateBookings = await Booking.find({
      expiresAt: { $lt: new Date() },
      status: 'booked'
    });

    for (const booking of lateBookings) {
      await withTransaction(async (session) => {
        // Update booking status
        booking.status = 'late';
        await booking.save({ session });

        // Deduct 1 coin as penalty
        const user = await User.findById(booking.userId).session(session);
        const wallet = await Wallet.findById(user.walletId).session(session);
        wallet.balance -= 1;
        await wallet.save({ session });

        console.log(`Late penalty applied to booking ${booking._id}`);
      });
    }
  } catch (error) {
    console.error('Error processing late bookings:', error);
  }
};

// Run the late booking check every minute
setInterval(processLateBookings, 60 * 1000);
