import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { Incident } from "../models/Incident";

// GET /api/incidents
export async function getIncidents(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, severity, q, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status)   filter.status   = status;
    if (severity) filter.severity = severity;
    if (q)        filter.$text    = { $search: q };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [incidents, total] = await Promise.all([
      Incident.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Incident.countDocuments(filter),
    ]);
    res.json({ success: true, data: incidents, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

// GET /api/incidents/:id
export async function getIncident(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) { res.status(404).json({ success: false, message: "Incident not found" }); return; }
    res.json({ success: true, data: incident });
  } catch (err) { next(err); }
}

// POST /api/incidents
export async function createIncident(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const incident = await Incident.create({
      ...req.body,
      reportedBy: req.body.reportedBy ?? req.user?.name ?? "system",
      timeline: [{ action: "reported", performedBy: req.user?.name ?? "system", timestamp: new Date() }],
    });

    // Notify admins and managers
    const { createSystemNotification } = await import("../utils/notifications");
    await createSystemNotification({
      role: "admin",
      type: "warning",
      title: "New Incident Reported",
      message: `${incident.title} (${incident.severity} severity) reported at ${incident.location}`,
      link: `/incidents`
    });
    await createSystemNotification({
      role: "manager",
      type: "warning",
      title: "New Incident Reported",
      message: `${incident.title} (${incident.severity} severity) reported at ${incident.location}`,
      link: `/incidents`
    });

    res.status(201).json({ success: true, data: incident });
  } catch (err) { next(err); }
}

// PATCH /api/incidents/:id
export async function updateIncident(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, ...rest } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) { res.status(404).json({ success: false, message: "Incident not found" }); return; }

    Object.assign(incident, rest);
    if (status && status !== incident.status) {
      incident.status = status;
      incident.timeline.push({ action: `status → ${status}`, performedBy: req.user?.name ?? "system", timestamp: new Date() });
      if (status === "resolved" || status === "closed") incident.resolvedAt = new Date();
    }
    await incident.save();
    res.json({ success: true, data: incident });
  } catch (err) { next(err); }
}

// DELETE /api/incidents/:id
export async function deleteIncident(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) { res.status(404).json({ success: false, message: "Incident not found" }); return; }
    res.json({ success: true, message: "Incident deleted" });
  } catch (err) { next(err); }
}
