import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  tenant: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // recipient
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: false }, // Optional for now
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["info", "warning", "error", "success"], default: "info" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
