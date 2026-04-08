import { Notification } from "../models/Notification";
import { User } from "../models/User";
import mongoose from "mongoose";

export async function createSystemNotification(params: {
  userId?: string | mongoose.Types.ObjectId;
  role?: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  link?: string;
}) {
  try {
    let userIds: any[] = [];
    if (params.userId) {
      userIds = [params.userId];
    } else if (params.role) {
      const users = await User.find({ role: params.role }).select("_id");
      userIds = users.map(u => u._id);
    } else {
      // Default to all admins if nothing specified
      const admins = await User.find({ role: "admin" }).select("_id");
      userIds = admins.map(u => u._id);
    }

    const notifications = userIds.map(uid => ({
      user: uid,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error("Failed to create system notification:", err);
  }
}
