import { Router } from 'express';
import { login, register, updateProfile , getUserById  } from '../controllers/authController.js';
import { driverLogin, driverRegister, getDriverById } from '../controllers/driversController.js';
import { verifyToken } from '../middleware/authmiddleware.js';

const router = Router();

// USER LOGIN END POINTS
router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', updateProfile);
router.get("/:id", verifyToken, getUserById);

// DRIVER LOGIN END POINTS 

router.post('/driver/login', driverLogin);
router.post('/driver/register', driverRegister);
router.get("/driver/:id", verifyToken, getDriverById);


export default router;

