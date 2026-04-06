import { Request, Response, NextFunction } from "express";
import { FMDocument } from "../models/FMDocument";

export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, status } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (status)   filter.status   = status;

    const docs = await FMDocument.find(filter).sort({ title: 1 });
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const total = await FMDocument.countDocuments();
    const active = await FMDocument.countDocuments({ status: "active" });
    
    // Expiring within 30 days
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiring = await FMDocument.countDocuments({
      expiryDate: { $gte: now.toISOString(), $lte: thirtyDays.toISOString() }
    });
    
    const expired = await FMDocument.countDocuments({
      $or: [
        { status: "expired" },
        { expiryDate: { $lt: now.toISOString(), $ne: "" } }
      ]
    });

    res.json({ success: true, data: { total, active, expiring, expired } });
  } catch (err) { next(err); }
}

export async function createDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await FMDocument.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await FMDocument.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await FMDocument.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
    res.json({ success: true, message: "Document deleted" });
  } catch (err) { next(err); }
}
