import {
  createTrip,
  getAllTrips,
  getMyTrips,
  patchTripStatus,
  getTripSeats
} from '../controllers/tripController.js';
import { Router } from 'express';
import { verifyToken } from '../middleware/authmiddleware.js';

const router = Router();


router.post('/', verifyToken,createTrip);
router.get('/', getAllTrips);
router.get('/my', verifyToken,getMyTrips);
router.patch('/:tripId/status', verifyToken,patchTripStatus);
router.get('/:tripId/seats',verifyToken, getTripSeats);

export default router;
