import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { getEnv } from "../config/env.js";
import Wallet from "../models/walletModel.js";

const { jwtSecret } = getEnv();

function signTokens(user, userType, wallet) {
  const sub = String(user._id);
  const accessToken = jwt.sign(
    { sub, userType: String(userType), wallet },
    jwtSecret,
    { expiresIn: "7d" }
  );
  return {
    access_token: accessToken,
    refresh_token: null,
    expires_in: 7 * 24 * 3600,
    token_type: "bearer",
    user: { id: sub, phone: user.phone, name: user.name, wallet: user.wallet },
  };
}

function normalizeEgyptPhone(raw) {
  // Accept formats like 010XXXX, 10XXXX, +2010XXXX, 2010XXXX and normalize to +20XXXXXXXXXX
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `+20${digits.slice(1)}`;
  }
  if (digits.startsWith("20")) {
    return `+${digits}`;
  }
  if (digits.length === 10 || digits.length === 11) {
    // fallback for 10-11 digits
    return digits.length === 11 && digits.startsWith("0")
      ? `+20${digits.slice(1)}`
      : `+20${digits}`;
  }
  return `+${digits}`;
}

function isValidEgyptPhone(normalized) {
  return /^\+20(10|11|12|15)\d{8}$/.test(normalized);
}

export async function register(req, res, next) {
  try {
    const { phone, password, name, home_address, collage_name } = req.body;
    if (!phone || !password)
      return res.status(400).json({ error: "phone and password are required" });
    const normalized = normalizeEgyptPhone(phone);
    if (!isValidEgyptPhone(normalized))
      return res.status(400).json({ error: "Invalid Egyptian phone number" });
    const existing = await User.findOne({ phone: normalized }).lean();
    if (existing)
      return res.status(400).json({ error: "Phone already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
   

    const user = await User.create({
      phone: normalized,
      passwordHash,
      name,
      home_address,
      collage_name,
    });
    const wallet = new Wallet({ userId: user._id });
    await wallet.save();
    user.walletId = wallet._id;
    await user.save();
    const tokens = signTokens(user, "user", user.walletId);
    return res.status(201).json(tokens);
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ error: "phone and password are required" });
    const normalized = normalizeEgyptPhone(phone);
    if (!isValidEgyptPhone(normalized))
      return res.status(400).json({ error: "Invalid Egyptian phone number" });
    const user = await User.findOne({ phone: normalized });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const tokens = signTokens(user, "user", user.walletId);
    return res.json(tokens);
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const updates = { ...req.body };
    delete updates.password;
    delete updates.email;
    delete updates.phone; // prevent changing phone here
    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).lean();
    return res.json({ success: true, data: [updated] });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function getUserById(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
}
