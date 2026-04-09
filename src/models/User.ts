import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "manager" | "technician" | "viewer";
  department: string;
  active: boolean;
  lastLogin?: Date;
  notificationPreferences: {
    workOrderAssigned: boolean;
    pmScheduleDue: boolean;
    serviceRequestReported: boolean;
    lowStockAlert: boolean;
    assetStatusChange: boolean;
    vendorContractExpiry: boolean;
    workOrderOverdue: boolean;
    dailySummary: boolean;
  };
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:       { type: String, required: true, trim: true, maxlength: 100 },
    email:      { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, "Invalid email"] },
    password:   { type: String, required: true, minlength: 8, select: false },
    role:       { type: String, required: true, enum: ["admin","manager","technician","viewer"], default: "viewer" },
    department: { type: String, trim: true, default: "" },
    active:     { type: Boolean, default: true },
    lastLogin:  { type: Date },
    notificationPreferences: {
      workOrderAssigned:    { type: Boolean, default: true },
      pmScheduleDue:        { type: Boolean, default: true },
      serviceRequestReported:      { type: Boolean, default: true },
      lowStockAlert:        { type: Boolean, default: true },
      assetStatusChange:    { type: Boolean, default: false },
      vendorContractExpiry: { type: Boolean, default: true },
      workOrderOverdue:     { type: Boolean, default: true },
      dailySummary:         { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", UserSchema, "users");
