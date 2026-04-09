import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { ServiceRequest } from "../models/ServiceRequest";

// GET /api/service-requests
export async function getServiceRequests(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, severity, q, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status)   filter.status   = status;
    if (severity) filter.severity = severity;
    if (q)        filter.$text    = { $search: q };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [serviceRequests, total] = await Promise.all([
      ServiceRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      ServiceRequest.countDocuments(filter),
    ]);
    res.json({ success: true, data: serviceRequests, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

// GET /api/service-requests/:id
export async function getServiceRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) { res.status(404).json({ success: false, message: "Service Request not found" }); return; }
    res.json({ success: true, data: serviceRequest });
  } catch (err) { next(err); }
}

// POST /api/service-requests
export async function createServiceRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const serviceRequest = await ServiceRequest.create({
      ...req.body,
      reportedBy: req.body.reportedBy ?? req.user?.name ?? "system",
      timeline: [{ action: "reported", performedBy: req.user?.name ?? "system", timestamp: new Date() }],
    });

    // Notify admins and managers
    const { createSystemNotification } = await import("../utils/notifications");
    await createSystemNotification({
      role: "admin",
      type: "warning",
      title: "New Service Request Reported",
      message: `${serviceRequest.title} (${serviceRequest.severity} severity) reported at ${serviceRequest.location}`,
      link: `/service-requests`
    });
    await createSystemNotification({
      role: "manager",
      type: "warning",
      title: "New Service Request Reported",
      message: `${serviceRequest.title} (${serviceRequest.severity} severity) reported at ${serviceRequest.location}`,
      link: `/service-requests`
    });

    res.status(201).json({ success: true, data: serviceRequest });
  } catch (err) { next(err); }
}

// PATCH /api/service-requests/:id
export async function updateServiceRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, ...rest } = req.body;
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) { res.status(404).json({ success: false, message: "Service Request not found" }); return; }

    Object.assign(serviceRequest, rest);
    if (status && status !== serviceRequest.status) {
      serviceRequest.status = status;
      serviceRequest.timeline.push({ action: `status → ${status}`, performedBy: req.user?.name ?? "system", timestamp: new Date() });
      if (status === "resolved" || status === "closed") serviceRequest.resolvedAt = new Date();
    }
    await serviceRequest.save();
    res.json({ success: true, data: serviceRequest });
  } catch (err) { next(err); }
}

// DELETE /api/service-requests/:id
export async function deleteServiceRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const serviceRequest = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!serviceRequest) { res.status(404).json({ success: false, message: "Service Request not found" }); return; }
    res.json({ success: true, message: "Service Request deleted" });
  } catch (err) { next(err); }
}
