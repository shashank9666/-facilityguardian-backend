import { Request, Response, NextFunction } from "express";
import { PMSchedule } from "../models/PMSchedule";

// GET /api/maintenance
export async function getSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, frequency, assetId, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status)    filter.status    = status;
    if (frequency) filter.frequency = frequency;
    if (assetId)   filter.assetId   = assetId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [schedules, total] = await Promise.all([
      PMSchedule.find(filter).sort({ nextDue: 1 }).skip(skip).limit(parseInt(limit)),
      PMSchedule.countDocuments(filter),
    ]);
    res.json({ success: true, data: schedules, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

// GET /api/maintenance/:id
export async function getSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await PMSchedule.findById(req.params.id);
    if (!schedule) { res.status(404).json({ success: false, message: "PM schedule not found" }); return; }
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
}

// POST /api/maintenance
export async function createSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await PMSchedule.create(req.body);
    res.status(201).json({ success: true, data: schedule });
  } catch (err) { next(err); }
}

// PATCH /api/maintenance/:id
export async function updateSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await PMSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!schedule) { res.status(404).json({ success: false, message: "PM schedule not found" }); return; }
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
}

// PATCH /api/maintenance/:id/complete — mark task done, advance nextDue, create record
export async function completeSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { WorkOrder } = await import("../models/WorkOrder");
    const schedule = await PMSchedule.findById(req.params.id);
    if (!schedule) { res.status(404).json({ success: false, message: "PM schedule not found" }); return; }

    // 1. Create a historical Work Order record
    await WorkOrder.create({
      title: `PM: ${schedule.title}`,
      description: `Completed periodic maintenance cycle for ${schedule.assetName}.`,
      category: "Maintenance",
      type: "preventive",
      priority: "medium",
      status: "completed",
      assetId: schedule.assetId,
      assignedTo: schedule.assignedTo,
      requestedBy: "FMNexus System",
      closedAt: new Date(),
      completedAt: new Date(),
      auditLog: [{ action: "completed via PM schedule", performedBy: (req as any).user.name, timestamp: new Date() }]
    });

    schedule.lastCompleted = new Date();
    schedule.status        = "active";

    // 2. Advance nextDue based on frequency
    const nextDate = new Date();
    const freqDays: Record<string, number> = {
      daily: 1, weekly: 7, monthly: 30, quarterly: 90, "semi-annual": 180, annual: 365,
    };
    const days = freqDays[schedule.frequency] ?? 30;
    nextDate.setDate(nextDate.getDate() + days);
    schedule.nextDue = nextDate;

    // 3. Reset checklist items for the fresh cycle (using map to ensure Mongoose tracks the change)
    schedule.checklist = schedule.checklist.map(item => {
      const plain = (item as any).toObject ? (item as any).toObject() : item;
      return { ...plain, completed: false };
    }) as any;
    
    await schedule.save();
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
}

// DELETE /api/maintenance/:id
export async function deleteSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await PMSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) { res.status(404).json({ success: false, message: "PM schedule not found" }); return; }
    res.json({ success: true, message: "PM schedule deleted" });
  } catch (err) { next(err); }
}
