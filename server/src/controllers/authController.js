import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { getJwtSecret } from "../utils/jwt.js";

const otpStore = new Map();

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    let existingUser = await User.findOne({
      $or: [{ email: email || "null" }, { phone: phone || "null" }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: email || undefined,
      phone: phone || undefined,
    });

    const identifier = email || phone;
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(identifier, { otp, expiresAt, userId: user._id });

    if (identifier.includes("@")) {
      try {
        await sendEmail({
          email: identifier,
          subject: "Assessment App Registration OTP",
          message: `Your registration OTP is ${otp}. It expires in 5 minutes.`,
        });
      } catch (err) {
        console.error("Email error:", err);
      }
    } else {
      console.log(`[MOCK SMS] OTP: ${otp} to ${identifier}`);
    }

    return res.status(201).json({
      message: "User registered successfully. OTP sent.",
      identifier,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ message: "Identifier is required" });
    }

    let existingUser = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(identifier, { otp, expiresAt, userId: existingUser._id });

    if (identifier.includes("@")) {
      try {
        await sendEmail({
          email: identifier,
          subject: "Assessment App Login OTP",
          message: `Your login OTP is ${otp}. It expires in 5 minutes.`,
        });
      } catch (err) {
        console.error("Email error:", err);
      }
    } else {
      console.log(`[MOCK SMS] OTP: ${otp} to ${identifier}`);
    }

    return res.status(200).json({
      message: "OTP generated successfully sent.",
      identifier,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ message: "Identifier and OTP required" });
    }

    const storedData = otpStore.get(identifier);
    if (!storedData) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findById(storedData.userId);

    otpStore.delete(identifier);
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "OTP verified successfully",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
