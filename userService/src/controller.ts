import type { AuthenticatedRequest } from "./middleware.js";
import User from "./model.js";
import TryCatch from "./TryCatch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = TryCatch(async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let user = await User.findOne({ email });

  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashPassword,
    role: "user", 
  });

  const jwtSecret = process.env.JWT_SEC;
  if (!jwtSecret) throw new Error("JWT secret not defined");

  const token = jwt.sign({ _id: user._id }, jwtSecret, { expiresIn: "7d" });

  const { password: _removed, ...userWithoutPassword } = user.toObject();

  res.status(201).json({
    message: "User Registered",
    user: userWithoutPassword,
    token,
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body
  
  const user = await User.findOne({ email })

  if (!user) {
    res.status(404).json({
      message: "User does not exists"
    })

    return;
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    res.status(400).json({
      message: "Credentials does not match"
    });

    return;
  }

  const jwtSecret = process.env.JWT_SEC;
  if (!jwtSecret) throw new Error("JWT secret not defined");

  const token = jwt.sign({ _id: user._id }, jwtSecret, { expiresIn: "7d" });

  const { password: _removed, ...userWithoutPassword } = user.toObject();

  res.status(201).json({
    message: "Logged in",
    user: userWithoutPassword,
    token,
  });
})

export const userProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  res.json(user);
})
