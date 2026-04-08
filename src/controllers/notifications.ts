import { Request, Response, NextFunction } from "express";
import { Notification } from "../models/Notification";

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await Notification.find({ user: (req as any).user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const n = await Notification.findOneAndUpdate(
      { _id: id, user: (req as any).user.id },
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: n });
  } catch (err) { next(err); }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await Notification.updateMany(
      { user: (req as any).user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, user: (req as any).user.id });
    res.json({ success: true });
  } catch (err) { next(err); }
}
