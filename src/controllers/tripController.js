import Trip from '../models/tripModel.js';
import Driver from "../models/driverModel.js";


// إضافة رحلة جديدة
export async function createTrip(req, res) {
  try {
    const driver_id = req.user._id; 

    const { route_name, time, capacity, route, price } = req.body;

    if (!route || !time || !capacity)
      return res.status(400).json({ error: "كل الحقول مطلوبة" });

    const driver = await Driver.findById(req.user._id);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }


    const trip = await Trip.create({
      
      driver_id,
      time,
      capacity,
      route : {
        start: route.start,
        end: route.end,
      },
      price,
      availableSeats: capacity, // Automatic
      seats: Array.from({ length: capacity }, (_, i) => ({
        seatNumber: i + 1,
        isBooked: false,
        bookedBy: null,
      })),
      driver: {
        driver_id: driver._id,
        name: driver.name,
        phone: driver.phone,
        carModel: driver.carModel,
        carNumber: driver.carNumber,
      },
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء الرحلة بنجاح",
      trip,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}


// عرض كل الرحلات
export async function getAllTrips(req, res) {
  try {
    const trips = await Trip.find({}).sort({ time: 1 }).lean();
    res.status(200).json({ success: true, count: trips.length, trips });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

// عرض رحلات السائق نفسه
export async function getMyTrips(req, res) {
  try {
    const trips = await Trip.find({ driver_id: req.user._id }).sort({ time: 1 }).lean();
    res.status(200).json({ success: true, count: trips.length, trips });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

// تعديل حالة الرحلة
export async function patchTripStatus(req, res) {
  try {
    const { tripId } = req.params;
    const { status } = req.body;

    const trip = await Trip.findOne({ _id: tripId, driver_id: req.user._id });
    if (!trip) return res.status(404).json({ error: 'Trip not found or not your trip' });

    trip.status = status;
    await trip.save();
    res.status(200).json({ success: true, trip });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

// عرض حالة الكراسي
export async function getTripSeats(req, res) {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId).lean();
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.status(200).json({
      success: true,
      availableSeats: trip.availableSeats,
      seats: trip.seats
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}
