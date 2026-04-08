import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

function signToken(id: string): string {
  const secret  = process.env.JWT_SECRET ?? "fallback-secret";
  const expires = process.env.JWT_EXPIRES_IN ?? "7d";
  return jwt.sign({ id }, secret, { expiresIn: expires } as jwt.SignOptions);
}

// POST /api/auth/register
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, role } = req.body as {
      name: string; email: string; password: string; role?: string;
    };

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }

    const user  = await User.create({ name, email: email.toLowerCase(), password, role: role ?? "viewer" });
    const token = signToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
}

// POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +active");
    if (!user || !user.active) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const match = await user.comparePassword(password);
    if (!match) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = signToken(user._id.toString());
    res.json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
}

// GET /api/auth/me
export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

// PATCH /api/auth/me
export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.user?._id, rest, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

// PATCH /api/auth/change-password
export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string; newPassword: string;
    };
    const user = await User.findById(req.user?._id).select("+password");
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }

    const match = await user.comparePassword(currentPassword);
    if (!match) {
      res.status(401).json({ success: false, message: "Current password is incorrect" });
      return;
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated" });
  } catch (err) { next(err); }
}

// GET /api/auth/users  (admin only)
export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
}

// GET /api/auth/technicians (any authenticated user)
// Returns public list of assignable users
export async function getTechnicians(req: Request, res: Response, next: NextFunction) {
  try {
    const technicians = await User.find({
      role: { $in: ["technician", "manager"] },
      active: true
    })
    .select("name email role department active")
    .sort({ name: 1 });
    
    res.json({ success: true, data: technicians });
  } catch (err) { next(err); }
}

// PATCH /api/auth/users/:id  (admin only)
export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true });
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

// DELETE /api/auth/users/:id  (admin only)
export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    res.json({ success: true, message: "User deleted" });
  } catch (err) { next(err); }
}
