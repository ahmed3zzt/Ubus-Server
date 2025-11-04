import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Driver from "../models/driverModel.js";
// DrIVERS

// تسجيل سواق جديد

export async function driverRegister(req, res) {
    try {
      const { name, phone, password, busCapacity , to , from } = req.body;
  
      // check if driver exists
      const existing = await Driver.findOne({ phone });
      if (existing) return res.status(400).json({ error: "الرقم مسجل بالفعل" });
  
      // generate bus number automatically
      const count = await Driver.countDocuments();
      const busNumber = `BUS-${count + 1}`;
  
      const newDriver = await Driver.create({
        name,
        phone,
        password,
        busCapacity: busCapacity || 12,
        busNumber,
        route: {
          to,
          from,
        },
      });
  
      res.json({ message: "تم التسجيل بنجاح", driver: newDriver });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // تسجيل دخول السواق
  export async function driverLogin(req, res) {
    try {
      const { phone, password } = req.body;
      const driver = await Driver.findOne({ phone });
      if (!driver) return res.status(404).json({ error: "السائق غير موجود" });
  
      const match = await bcrypt.compare(password, driver.password);
      if (!match) return res.status(401).json({ error: "كلمة السر غير صحيحة" });
  
      const token = jwt.sign(
        { _id: driver._id, phone: driver.phone },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
  
      res.json({ message: "تم تسجيل الدخول", token, driver });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };



export async function getDriverById(req, res) {
  try {
    const driverId = req.params.id;
    const driver = await Driver.findById(driverId).select("-password"); // استبعد الباسورد

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ error: "Server error" });
  }
}
